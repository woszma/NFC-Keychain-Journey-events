/**
 * NFC Keychain Journey - Backend Routes Framework
 * 後端路由框架（Express + Supabase）- 功能 A + D
 * 
 * 使用方式：
 * import blessingsRouter from './routes/blessings';
 * import reactionsRouter from './routes/reactions';
 * app.use('/api', blessingsRouter);
 * app.use('/api', reactionsRouter);
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type {
  CreateBlessingRequest,
  BlessingResponse,
  CreateReportRequest,
  ReportResponse,
  GetReactionParams,
  ReactionResponse,
  ErrorResponse
} from '../lib/api.types';

dotenv.config();

// ============================================
// 設定與中介軟體
// ============================================

const shortSupabaseUrl = process.env.VITE_SUPABASE_URL
  ? `${process.env.VITE_SUPABASE_URL.substring(0, 30)}...`
  : '(not set)';
console.log('DEBUG routes.ts load: VITE_SUPABASE_URL =', shortSupabaseUrl);
console.log('DEBUG routes.ts load: VITE_SUPABASE_ANON_KEY length =', (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').length);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

console.log('DEBUG routes.ts: Supabase client created');

// 速率限制 store（簡化版，生產應使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * 中介軟體: 速率限制（5 分鐘內最多 3 個請求）
 * 開發環境下禁用（NODE_ENV !== 'production'），生產環境啟用
 */
function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // 非生產環境下跳過速率限制
  if (process.env.NODE_ENV !== 'production') {
    console.log('DEBUG: Rate limiting disabled (not production)');
    return next();
  }

  const clientIp = req.ip || 'unknown';
  const now = Date.now();
  const limit = rateLimitStore.get(clientIp);

  if (limit && now < limit.resetTime) {
    if (limit.count >= 3) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: '超過速率限制（5 分鐘內最多 3 個請求）',
        retry_after: Math.ceil((limit.resetTime - now) / 1000)
      } as ErrorResponse);
    }
    limit.count++;
  } else {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetTime: now + 5 * 60 * 1000 // 5 分鐘
    });
  }

  next();
}

/**
 * 中介軟體: 錯誤處理
 */
function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: err.message || '內部伺服器錯誤'
  } as ErrorResponse);
}

// ============================================
// 功能 A: 祝福路由
// ============================================

const blessingsRouter = express.Router();

/**
 * POST /api/blessings - 建立祝福
 */
blessingsRouter.post('/blessings', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('POST /blessings triggered');
    const payload = req.body as CreateBlessingRequest;
    console.log('Payload received:', payload);

    // 1. 驗證請求
    if (!payload.keychain_id || !payload.blessing_text || !payload.code_phrase) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '缺少必填欄位: keychain_id, blessing_text, code_phrase',
        details: {
          keychain_id: payload.keychain_id ? 'OK' : 'missing',
          blessing_text: payload.blessing_text ? 'OK' : 'missing',
          code_phrase: payload.code_phrase ? 'OK' : 'missing'
        }
      } as ErrorResponse);
    }

    // 2. 驗證字數
    if (payload.blessing_text.length > 15) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '祝福文字超過 15 字',
        details: { max_length: 15, provided_length: payload.blessing_text.length }
      } as ErrorResponse);
    }

    if (payload.code_phrase.length > 10) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '暗語超過 10 字',
        details: { max_length: 10, provided_length: payload.code_phrase.length }
      } as ErrorResponse);
    }

    if (payload.optional_note && payload.optional_note.length > 120) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '備註超過 120 字',
        details: { max_length: 120, provided_length: payload.optional_note.length }
      } as ErrorResponse);
    }

    // 3. 伺服端 PII 檢測
    const textToCheck = `${payload.blessing_text} ${payload.code_phrase} ${payload.optional_note || ''}`;
    const piiPatterns = {
      phone_hk: /\b(\d{8})\b|\b(\+852[\d\s-]{7,})\b/,
      phone_cn: /\b1[3-9]\d{9}\b/,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      url: /https?:\/\/[^\s]+/,
      address_hk: /\b(香港|灣仔|中環|銅鑼灣|旺角|尖沙咀|佐敦|油麻地|油塘|觀塘|荃灣|屯門|大埔|沙田|元朗)\b/
    };

    const detectedPII: string[] = [];
    Object.entries(piiPatterns).forEach(([patternName, regex]) => {
      if (regex.test(textToCheck)) {
        detectedPII.push(patternName);
      }
    });

    if (detectedPII.length > 0) {
      return res.status(400).json({
        error: 'PII_DETECTED',
        message: '偵測到個人身份資訊，請檢查並移除',
        detected_patterns: detectedPII
      } as ErrorResponse);
    }

    // 4. 寫入資料庫
    console.log('DEBUG: Supabase client URL:', process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    console.log('DEBUG: Supabase anon key length:', (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').length);
    
    const { data, error } = await supabase
      .from('blessings')
      .insert([
        {
          keychain_id: payload.keychain_id,
          station_number: payload.station_number || 1,
          blessing_text: payload.blessing_text,
          code_phrase: payload.code_phrase,
          optional_note: payload.optional_note,
          visibility: payload.visibility || 'public',
          is_hidden: false,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase INSERT error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '資料庫寫入失敗',
        details: { message: error.message }
      } as ErrorResponse);
    }

    res.status(201).json(data?.[0] as BlessingResponse);
  } catch (err) {
    console.error('Error creating blessing:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '建立祝福時發生錯誤'
    } as ErrorResponse);
  }
});

/**
 * GET /api/blessings - 取得祝福列表
 * Query: keychain_id, station_number (optional), visibility (optional)
 */
blessingsRouter.get('/blessings', async (req: Request, res: Response) => {
  try {
    const { keychain_id, station_number, visibility } = req.query;

    if (!keychain_id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '缺少必填參數: keychain_id'
      } as ErrorResponse);
    }

    let query = supabase
      .from('blessings')
      .select('*')
      .eq('keychain_id', keychain_id as string)
      .eq('is_hidden', false); // 預設只顯示未隱藏的祝福

    if (station_number) {
      query = query.eq('station_number', Number(station_number));
    }

    if (visibility) {
      query = query.eq('visibility', visibility as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '查詢祝福列表失敗'
      } as ErrorResponse);
    }

    res.json(data as BlessingResponse[]);
  } catch (err) {
    console.error('Error fetching blessings:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '取得祝福列表時發生錯誤'
    } as ErrorResponse);
  }
});

/**
 * PATCH /api/blessings/:id/hide - 隱藏祝福（管理員用）
 */
blessingsRouter.patch('/blessings/:id/hide', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_hidden } = req.body;

    const { data, error } = await supabase
      .from('blessings')
      .update({ is_hidden })
      .eq('id', Number(id))
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '更新祝福狀態失敗'
      } as ErrorResponse);
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '祝福不存在'
      } as ErrorResponse);
    }

    res.json(data[0] as BlessingResponse);
  } catch (err) {
    console.error('Error hiding blessing:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '隱藏祝福時發生錯誤'
    } as ErrorResponse);
  }
});

// ============================================
// 功能 A: 舉報路由
// ============================================

/**
 * POST /api/reports - 建立舉報
 */
blessingsRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateReportRequest;

    if (!payload.blessing_id || !payload.reason) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '缺少必填欄位: blessing_id, reason'
      } as ErrorResponse);
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          blessing_id: payload.blessing_id,
          reason: payload.reason,
          description: payload.description,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '資料庫寫入失敗'
      } as ErrorResponse);
    }

    res.status(201).json(data?.[0] as ReportResponse);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '建立舉報時發生錯誤'
    } as ErrorResponse);
  }
});

// ============================================
// 功能 D: 小將回應路由
// ============================================

const reactionsRouter = express.Router();

/**
 * 輔助函數: 產生確定性雜湊
 * 基於 journey_id + station_number，產生相同的索引
 */
function generateDeterministicSeed(journeyId: string, stationNumber: number): number {
  const str = `${journeyId}-${stationNumber}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * GET /api/reactions - 取得小將回應
 * Query: journey_id, station_number
 */
reactionsRouter.get('/reactions', async (req: Request, res: Response) => {
  try {
    const { journey_id, station_number } = req.query;

    if (!journey_id || !station_number) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '缺少必填參數: journey_id, station_number'
      } as ErrorResponse);
    }

    // 1. 取得所有可用的回應句子
    const { data: reactions, error } = await supabase
      .from('elephant_reactions')
      .select('id, reaction_text, category, emotion_type')
      .eq('status', 'active')
      .order('id');

    if (error || !reactions || reactions.length === 0) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '無法取得回應資料'
      } as ErrorResponse);
    }

    // 2. 基於 journey_id + station_number 產生確定性雜湊
    const seed = generateDeterministicSeed(journey_id as string, Number(station_number));

    // 3. 用雜湊值選擇回應
    const selectedIndex = seed % reactions.length;
    const selectedReaction = reactions[selectedIndex];

    // 4. 回傳結果（包含 seed 便於驗證）
    const response: ReactionResponse = {
      id: selectedReaction.id,
      reaction_text: selectedReaction.reaction_text,
      category: selectedReaction.category,
      emotion_type: selectedReaction.emotion_type,
      seed: seed,
      journey_id: journey_id as string,
      station_number: Number(station_number)
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching reaction:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '取得回應時發生錯誤'
    } as ErrorResponse);
  }
});

// ============================================
// 路由匯出
// ============================================

export { blessingsRouter, reactionsRouter, errorHandler };

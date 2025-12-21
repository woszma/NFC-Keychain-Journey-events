/**
 * NFC Keychain Journey - Express API 伺服器初始化
 * Phase 1: 功能 A (冒險者留言) + 功能 D (小將回應)
 * 
 * 啟動: npx tsx src/server.ts
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { promises as fsp } from 'fs';
import path from 'path';
import { blessingsRouter, reactionsRouter, errorHandler } from '../routes/routes.ts';

dotenv.config();

// 可用環境變數控制是否輸出請求/啟動 debug 日誌（在生產或停止此功能時設為 'false'）
const ENABLE_REQUEST_LOGS = process.env.REQUEST_LOGS !== 'false';

if (ENABLE_REQUEST_LOGS) {
  console.log('DEBUG server.ts: blessingsRouter =', blessingsRouter);
  console.log('DEBUG server.ts: reactionsRouter =', reactionsRouter);
}

const app: Express = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.VITE_CLIENT_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// ============================================
// 中介軟體配置
// ============================================

// CORS 設定 - 允許前端請求
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// JSON 解析
app.use(express.json());

// 日誌中介軟體
app.use((req: Request, res: Response, next) => {
  if (!ENABLE_REQUEST_LOGS) return next();

  // 只在開啟日誌時才組裝摘要，避免未必要的 CPU/記憶體開銷
  const safeHeaders = {
    host: req.headers.host,
    'user-agent': req.headers['user-agent'],
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'x-forwarded-for': req.headers['x-forwarded-for']
  };

  const bodyPreview = (() => {
    try {
      if (!req.body) return null;
      const s = JSON.stringify(req.body);
      return s.length > 200 ? `${s.slice(0, 200)}… (truncated, ${s.length} bytes)` : s;
    } catch {
      return '[unserializable body]';
    }
  })();

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} headers=${Object.keys(req.headers).length} safe=${JSON.stringify(safeHeaders)}`);
  if (bodyPreview) console.log(`[DEBUG] body: ${bodyPreview}`);
  next();
});

// ============================================
// 測試路由（驗證中介軟體是否運作）
// ============================================

app.get('/test', (req: Request, res: Response) => {
  console.log('GET /test triggered');
  res.json({ message: 'Test route works!' });
});

// ============================================
// 健康檢查端點
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API 版本資訊
// ============================================

app.get('/api/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0-phase1',
    phase: 'Phase 1 (Features A + D)',
    endpoints: [
      'POST /api/blessings',
      'GET /api/blessings',
      'PATCH /api/blessings/:id/hide',
      'POST /api/reports',
      'GET /api/reactions'
    ],
    documentation: '/api/docs'
  });
});

// ============================================
// API 路由
// ============================================

// 功能 A: 祝福 & 舉報
app.use('/api', blessingsRouter);

// 功能 D: 小將回應
app.use('/api', reactionsRouter);

// ============================================
// 404 處理
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    available_endpoints: [
      'POST /api/blessings',
      'GET /api/blessings',
      'PATCH /api/blessings/:id/hide',
      'POST /api/reports',
      'GET /api/reactions',
      'GET /health',
      'GET /api/version'
    ]
  });
});

// ============================================
// 全局錯誤處理
// ============================================

app.use(errorHandler);

// ============================================
// 伺服器啟動
// ============================================

const PID_FILE = path.resolve(process.cwd(), 'server.pid');

(async () => {
  // 若存在 pid 檔且該 PID 正在運行，拒絕啟動以避免多重實例
  try {
    const existing = await fsp.readFile(PID_FILE, 'utf8').catch(() => null);
    if (existing) {
      const pid = parseInt(existing, 10);
      if (!Number.isNaN(pid)) {
        try {
          process.kill(pid, 0);
          console.error(`PID file exists and process ${pid} is running — aborting start.`);
          process.exit(1);
        } catch {
          // PID not running -> will overwrite
        }
      }
    }
  } catch (err) {
    // ignore
  }

  const server = app.listen(PORT, async () => {
    await fsp.writeFile(PID_FILE, String(process.pid));
    console.log(`\nServer listening on http://localhost:${PORT} (pid=${process.pid})\n`);
  });

  const cleanup = async () => {
    try {
      await fsp.unlink(PID_FILE).catch(() => null);
    } catch {}
  };

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      console.log('HTTP server closed');
      await cleanup();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(async () => {
      console.log('HTTP server closed');
      await cleanup();
      process.exit(0);
    });
  });

  process.on('exit', async () => {
    await cleanup();
  });
})();

// 優雅關閉處理已在啟動流程內處理（使用 PID file 及 SIG handlers）

// ============================================
// 未捕獲例外處理
// ============================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;

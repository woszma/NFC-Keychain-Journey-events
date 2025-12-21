/**
 * NFC Keychain Journey - React Hooks for API Integration
 * 前端使用，呼叫後端 API（功能 A + D）
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  CreateBlessingRequest,
  BlessingResponse,
  GetBlessingsParams,
  CreateReportRequest,
  ReportResponse,
  GetReactionParams,
  ReactionResponse,
  ErrorResponse
} from '../api.types';

// ============================================
// API 基礎設定
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// ============================================
// 功能 A: 祝福 Hooks
// ============================================

/**
 * Hook: 提交祝福
 * 使用：
 * const { createBlessing, loading, error, data } = useCreateBlessing();
 * await createBlessing({ keychain_id: '...', blessing_text: '...' });
 */
export function useCreateBlessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [data, setData] = useState<BlessingResponse | null>(null);

  const createBlessing = useCallback(async (payload: CreateBlessingRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/blessings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        setError(errorData);
        throw new Error(errorData.error);
      }

      const result = (await response.json()) as BlessingResponse;
      setData(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to create blessing:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBlessing, loading, error, data };
}

/**
 * Hook: 取得祝福列表
 * 使用：
 * const { blessings, loading, error } = useGetBlessings({ keychain_id: '...' });
 */
export function useGetBlessings(params: GetBlessingsParams) {
  const [blessings, setBlessings] = useState<BlessingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const fetchBlessings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        keychain_id: params.keychain_id,
        ...(params.station_number && { station_number: params.station_number.toString() }),
        ...(params.visibility && { visibility: params.visibility })
      });

      const response = await fetch(`${API_BASE_URL}/blessings?${queryParams}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        setError(errorData);
        throw new Error(errorData.error);
      }

      const result = (await response.json()) as BlessingResponse[];
      setBlessings(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch blessings:', err);
    } finally {
      setLoading(false);
    }
  }, [params.keychain_id, params.station_number, params.visibility]);

  // 自動在 mount 時取資料
  useEffect(() => {
    fetchBlessings();
  }, [fetchBlessings]);

  return { blessings, loading, error, refetch: fetchBlessings };
}

/**
 * Hook: 隱藏祝福（管理員用）
 */
export function useHideBlessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const hideBlessing = useCallback(async (blessingId: number, isHidden: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/blessings/${blessingId}/hide`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_hidden: isHidden })
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        setError(errorData);
        throw new Error(errorData.error);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to hide blessing:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { hideBlessing, loading, error };
}

// ============================================
// 功能 A: 舉報 Hooks
// ============================================

/**
 * Hook: 舉報祝福
 * 使用：
 * const { createReport, loading } = useCreateReport();
 * await createReport({ blessing_id: 1, reason: 'PII_EXPOSED' });
 */
export function useCreateReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [data, setData] = useState<ReportResponse | null>(null);

  const createReport = useCallback(async (payload: CreateReportRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        setError(errorData);
        throw new Error(errorData.error);
      }

      const result = (await response.json()) as ReportResponse;
      setData(result);
      return result;
    } catch (err) {
      console.error('Failed to create report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createReport, loading, error, data };
}

// ============================================
// 功能 D: 小將回應 Hooks
// ============================================

/**
 * Hook: 取得小將回應
 * 使用：
 * const { reaction, loading } = useGetReaction({ journey_id: '...', station_number: 1 });
 */
export function useGetReaction(params: GetReactionParams) {
  const [reaction, setReaction] = useState<ReactionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const fetchReaction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        journey_id: params.journey_id,
        station_number: params.station_number.toString()
      });

      const response = await fetch(`${API_BASE_URL}/reactions?${queryParams}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        setError(errorData);
        throw new Error(errorData.error);
      }

      const result = (await response.json()) as ReactionResponse;
      setReaction(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch reaction:', err);
    } finally {
      setLoading(false);
    }
  }, [params.journey_id, params.station_number]);

  return { reaction, loading, error, refetch: fetchReaction };
}

// ============================================
// 輔助 Hooks: 驗證與 PII 檢測
// ============================================

/**
 * Hook: 客戶端 PII 檢測
 * 使用：
 * const { isPII, detectedPatterns } = usePIIDetection(text);
 */
export function usePIIDetection(text: string) {
  const [isPII, setIsPII] = useState(false);
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);

  useEffect(() => {
    const patterns = {
      phone_hk: /\b(\d{8})\b|\b(\+852[\d\s-]{7,})\b/g,
      phone_cn: /\b1[3-9]\d{9}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/[^\s]+/g,
      address_hk: /\b(香港|灣仔|中環|銅鑼灣|旺角|尖沙咀|佐敦|油麻地|油塘|觀塘|荃灣|屯門|大埔|沙田|元朗)\b/g
    };

    const detected: string[] = [];
    Object.entries(patterns).forEach(([patternName, regex]) => {
      if (regex.test(text)) {
        detected.push(patternName);
      }
    });

    setDetectedPatterns(detected);
    setIsPII(detected.length > 0);
  }, [text]);

  return { isPII, detectedPatterns };
}

/**
 * Hook: 字數計數與驗證
 */
export function useCharacterCount(text: string, maxLength: number) {
  const [count, setCount] = useState(0);
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    const len = text.length;
    setCount(len);
    setIsExceeded(len > maxLength);
  }, [text, maxLength]);

  return { count, isExceeded, remaining: Math.max(0, maxLength - count) };
}

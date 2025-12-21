/**
 * NFC Keychain Journey - Phase 1 API Types
 * 自動生成的 TypeScript 類型定義（對應 OpenAPI 規格）
 */

// ============================================
// 功能 A: 冒險者留言（Blessings）
// ============================================

export interface CreateBlessingRequest {
  keychain_id: string;
  station_number?: number;
  quest_tag?: string;
  blessing_text: string; // max 15 chars
  code_phrase: string; // max 10 chars
  optional_note?: string; // max 120 chars
  visibility?: 'private' | 'public';
}

export interface BlessingResponse {
  id: number;
  keychain_id: string;
  station_number: number;
  quest_tag?: string;
  blessing_text: string;
  code_phrase?: string;
  optional_note?: string;
  visibility: 'private' | 'public';
  created_at: string; // ISO 8601 timestamp
  created_by?: string;
  reported_count?: number;
  is_hidden: boolean;
  reaction?: {
    reaction_text: string;
  };
}

export type GetBlessingsParams = {
  keychain_id: string;
  station_number?: number;
  visibility?: 'private' | 'public' | 'all';
};

export interface HideBlessingRequest {
  is_hidden: boolean;
  admin_reason?: string;
}

// ============================================
// 功能 A: 舉報（Reports）
// ============================================

export type ReportReason = 'PII_EXPOSED' | 'INAPPROPRIATE' | 'SPAM' | 'OTHER';

export interface CreateReportRequest {
  blessing_id: number;
  reason: ReportReason;
  description?: string;
  reported_by?: string;
}

export interface ReportResponse {
  id: number;
  blessing_id: number;
  reason: ReportReason;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  reported_by?: string;
}

// ============================================
// 功能 D: 小將回應（Elephant Reactions）
// ============================================

export type ReactionCategory = 'Blessing' | 'Encouragement' | 'Resonance' | 'Ritual';
export type ReactionType = 'Emotion' | 'Ritual' | 'Gratitude';

export interface ReactionResponse {
  id: number;
  reaction_text: string;
  category: ReactionCategory;
  emotion_type: ReactionType;
  seed: number; // deterministic seed (number)
  journey_id?: string;
  station_number?: number;
}

export type GetReactionParams = {
  journey_id: string; // 等同 keychain_id
  station_number: number;
};

// ============================================
// 錯誤回應
// ============================================

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PII_DETECTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface ErrorResponse {
  error: string;
  message?: string;
  code?: ErrorCode;
  details?: Record<string, unknown>;
  retry_after?: number; // 針對 RATE_LIMIT_EXCEEDED
}

// ============================================
// API 客戶端配置
// ============================================

export interface APIClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number; // ms
}

// ============================================
// 常數定義
// ============================================

export const API_ENDPOINTS = {
  BLESSINGS: {
    CREATE: 'POST /blessings',
    GET: 'GET /blessings',
    HIDE: 'PATCH /blessings/{id}/hide'
  },
  REPORTS: {
    CREATE: 'POST /reports'
  },
  REACTIONS: {
    GET: 'GET /reactions'
  }
} as const;

export const VALIDATION_RULES = {
  BLESSING_TEXT_MAX_LENGTH: 15,
  CODE_PHRASE_MAX_LENGTH: 10,
  OPTIONAL_NOTE_MAX_LENGTH: 120,
  REACTION_TEXT_MAX_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 200,
  RATE_LIMIT_WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  RATE_LIMIT_MAX_REQUESTS: 3
} as const;

export const PII_PATTERNS = {
  // 香港電話號碼（8 位）
  PHONE_HK: /\b(\d{8})\b|\b(\+852[\d\s-]{7,})\b/g,
  // 中國大陸電話（11 位，通常以 1 開頭）
  PHONE_CN: /\b1[3-9]\d{9}\b/g,
  // 簡單 Email 模式
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // 簡單 URL 模式
  URL: /https?:\/\/[^\s]+/g,
  // 香港地址關鍵詞（簡化）
  ADDRESS_HK: /\b(香港|灣仔|中環|銅鑼灣|旺角|尖沙咀|佐敦|油麻地|油塘|觀塘|荃灣|屯門|大埔|沙田|元朗)\b/g
} as const;

// ============================================
// 工具函數類型
// ============================================

export type PIICheckResult = {
  isPII: boolean;
  detectedPatterns: string[];
  message?: string;
};

export type DeterministicRandomnessInput = {
  journey_id: string;
  station_number: number;
};

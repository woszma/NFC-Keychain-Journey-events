/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// 安全地取得環境變數，避免在某些環境下 crash
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase 未設定或環境變數讀取失敗。\n' +
    'App 將以「預覽模式」執行，資料不會儲存到雲端資料庫。'
  );
}

// 如果沒有 URL，使用假網址防止 createClient 報錯崩潰
// 這樣 UI 仍然可以 render 出來供預覽
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
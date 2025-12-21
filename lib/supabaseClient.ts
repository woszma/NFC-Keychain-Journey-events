import { createClient } from '@supabase/supabase-js';

// FIX: In Vite, environment variables must be accessed directly (e.g. import.meta.env.VITE_KEY)
// for them to be statically replaced during the build process.
// Dynamic access (like import.meta.env[key]) will result in 'undefined' in production builds.

const getEnvVar = (key: string, value: string | undefined) => {
  if (!value) {
    return undefined;
  }
  return value;
};

// Access directly so Vite can bundle the values from your Secrets/Env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase Config Missing. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Codespaces Secrets.'
  );
}

// Initialize Client
// We provide fallback strings to prevent immediate crash on load, 
// but queries will be blocked by the isSupabaseConfigured check in App.tsx
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// ============================================
// 祝福 (Blessings) 操作 - Phase 1
// ============================================

export async function createBlessing(payload: any) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('blessings')
      .insert([
        {
          keychain_id: payload.keychain_id,
          station_number: payload.station_number || 1,
          blessing_text: payload.blessing_text,
          code_phrase: payload.code_phrase,
          optional_note: payload.optional_note || null,
          visibility: payload.visibility || 'public',
          is_hidden: false,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    return { data: data?.[0] || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getBlessings(keychainId: string, stationNumber?: number, visibility?: string) {
  if (!isSupabaseConfigured) return { data: [], error: 'Supabase not configured' };
  
  try {
    let query = supabase
      .from('blessings')
      .select('*')
      .eq('keychain_id', keychainId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (stationNumber !== undefined) {
      query = query.eq('station_number', stationNumber);
    }

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    const { data, error } = await query;
    return { data: data || [], error: error?.message || null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getBlessing(blessingId: number) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .eq('id', blessingId)
      .single();

    return { data: data || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function hideBlessing(blessingId: number, isHidden: boolean) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('blessings')
      .update({ is_hidden: isHidden, updated_at: new Date().toISOString() })
      .eq('id', blessingId)
      .select()
      .single();

    return { data: data || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// 舉報 (Reports) 操作 - Phase 1
// ============================================

export async function createReport(payload: any) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          blessing_id: payload.blessing_id,
          reason: payload.reason,
          description: payload.description || null,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    return { data: data?.[0] || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getReportsByBlessing(blessingId: number) {
  if (!isSupabaseConfigured) return { data: [], error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('blessing_id', blessingId)
      .order('created_at', { ascending: false });

    return { data: data || [], error: error?.message || null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// 小將回應 (Reactions) 操作 - Phase 1
// ============================================

export async function getActiveReactions() {
  if (!isSupabaseConfigured) return { data: [], error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('elephant_reactions')
      .select('id, reaction_text, category, emotion_type')
      .eq('status', 'active')
      .order('id');

    return { data: data || [], error: error?.message || null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createReaction(reactionText: string, category: string, emotionType: string) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('elephant_reactions')
      .insert([
        {
          reaction_text: reactionText,
          category: category,
          emotion_type: emotionType,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    return { data: data || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// 旅程 (Keychains) 操作
// ============================================

export async function createKeychain(keychainId: string, name: string) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('keychains')
      .insert([
        {
          id: keychainId,
          name: name,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    return { data: data || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getKeychain(keychainId: string) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('keychains')
      .select('*')
      .eq('id', keychainId)
      .single();

    return { data: data || null, error: error?.message || null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
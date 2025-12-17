import React, { useState, useEffect } from 'react';
import { Screen, HistoryEvent, GlobalStore } from './types';
import { PROMPT_POOL } from './constants';
import { Landing } from './components/screens/Landing';
import { Returning } from './components/screens/Returning';
import { NewInput } from './components/screens/NewInput';
import { Explanation } from './components/screens/Explanation';
import { HistoryView } from './components/screens/History';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ADMIN);
  
  // App Data State
  const [globalStore, setGlobalStore] = useState<GlobalStore>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Temporary state for the flow
  const [currentNewHolderName, setCurrentNewHolderName] = useState<string>('');
  const [currentExplanationData, setCurrentExplanationData] = useState<{
    giverName: string;
    previousPromptText: string;
    nextPromptText: string;
  } | null>(null);

  // --- DATA HANDLING ---

  const fetchEvents = async () => {
    // If config is missing, stop immediately.
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('NFC Keychain Journey events')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Supabase Error:', error.message);
        alert('無法讀取資料，請檢查網絡或資料庫設定。');
      } else {
        processDataToStore(data || []);
      }
    } catch (err) {
      console.error('Network/Unexpected Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const processDataToStore = (rawData: any[]) => {
    const store: GlobalStore = {};
    if (rawData) {
      rawData.forEach((event: any) => {
        // Ensure ID is string for React keys, even if DB returns number
        const kId = String(event.keychain_id);
        if (!store[kId]) store[kId] = [];
        store[kId].push({
          ...event,
          id: String(event.id)
        });
      });
    }
    setGlobalStore(store);
  };

  const saveEvent = async (event: HistoryEvent) => {
    // Optimistic Update (UI updates immediately)
    const currentList = globalStore[event.keychain_id] || [];
    const newHistory = [...currentList, event];
    const newStore = { ...globalStore, [event.keychain_id]: newHistory };
    setGlobalStore(newStore);

    // Save to Supabase
    // CRITICAL FIX: The DB 'id' is BigInt (auto-generated), but 'event.id' is a UUID string.
    // We explicitly construct the payload to ensure 'id' is NEVER sent to Supabase.
    // Using destructuring { id, ...rest } is safer, but explicit mapping is clearest.
    
    const payload = {
      keychain_id: event.keychain_id,
      timestamp: event.timestamp,
      from_name: event.from_name,
      to_name: event.to_name,
      prompt_key: event.prompt_key,
      prompt_text: event.prompt_text,
      next_prompt_key: event.next_prompt_key || null, // Ensure optional fields are handled
      next_prompt_text: event.next_prompt_text || null
    };

    const { error } = await supabase
      .from('NFC Keychain Journey events')
      .insert([payload]);
    
    if (error) {
      console.error('Failed to save to cloud:', error);
      alert('儲存到雲端失敗，請檢查網絡。詳細錯誤: ' + error.message);
    }
  };

  // --------------------------

  // Initialize
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }

    // Check URL for ID
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');

    if (idFromUrl) {
      const numId = parseInt(idFromUrl, 10);
      if (!isNaN(numId) && numId >= 0 && numId <= 99) {
        setActiveId(idFromUrl);
        setCurrentScreen(Screen.LANDING);
      } else {
        window.history.replaceState(null, '', '/');
        setCurrentScreen(Screen.ADMIN);
      }
    } else {
      setCurrentScreen(Screen.ADMIN);
    }
  }, []);

  // Helper: Get history for current active ID
  const activeHistory = activeId ? (globalStore[activeId] || []) : [];

  // Helper: Get Last Event
  const lastEvent = activeHistory.length > 0 
    ? activeHistory[activeHistory.length - 1] 
    : {
        id: 'init',
        keychain_id: activeId || '0',
        timestamp: Date.now(),
        from_name: '大象工廠',
        to_name: '未啟動',
        prompt_key: 'START',
        prompt_text: '旅程開始',
        next_prompt_key: 'START',
        next_prompt_text: '第一位主人'
      };

  const lastHolderName = activeHistory.length > 0 ? lastEvent.to_name : '沒有人';

  // --- Handlers ---

  const handleIdSelection = (id: string) => {
    setActiveId(id);
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setCurrentScreen(Screen.LANDING);
  };

  const handleBackToAdmin = () => {
    setActiveId(null);
    const newUrl = window.location.pathname; // Clear query params
    window.history.pushState({ path: newUrl }, '', newUrl);
    setCurrentScreen(Screen.ADMIN);
    fetchEvents(); // Refresh data
  };

  const handleNewHolderSubmit = async (name: string) => {
    if (!activeId) return;

    const isFirst = activeHistory.length === 0;

    // 1. Pick next prompt
    const randomIndex = Math.floor(Math.random() * PROMPT_POOL.length);
    const nextPrompt = PROMPT_POOL[randomIndex];

    // 2. Determine "Why I received it"
    const reasonIReceivedIt = isFirst 
      ? '這是一次偶然的相遇' 
      : (lastEvent.next_prompt_text || '命運的安排');

    // 3. Create Event Object
    const newEvent: HistoryEvent = {
      id: crypto.randomUUID(),
      keychain_id: activeId,
      timestamp: Date.now(),
      from_name: isFirst ? '大象女士' : lastHolderName,
      to_name: name,
      prompt_key: isFirst ? 'START' : (lastEvent.next_prompt_key || 'UNKNOWN'),
      prompt_text: reasonIReceivedIt,
      next_prompt_key: nextPrompt.key,
      next_prompt_text: nextPrompt.text
    };

    // 4. Save
    await saveEvent(newEvent);

    // 5. Update State & Navigate
    setCurrentNewHolderName(name);
    setCurrentExplanationData({
      giverName: isFirst ? '大象女士' : lastHolderName,
      previousPromptText: reasonIReceivedIt,
      nextPromptText: nextPrompt.text
    });

    setCurrentScreen(Screen.EXPLANATION);
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="text-4xl mb-4">🐘</div>
                <div className="text-stone-400 font-medium">載入旅程中...</div>
            </div>
        </div>
    );
  }

  // 🔴 Error State: Config Missing
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center text-stone-800">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h1 className="text-xl font-bold mb-2">尚未連接資料庫</h1>
        <p className="text-stone-600 max-w-md mb-6 leading-relaxed">
          應用程式無法讀取資料。請確認你已設定以下環境變數 (Secrets)：
        </p>
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm text-left space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${(import.meta as any).env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-red-400'}`}></div>
            <code className="text-sm font-mono bg-stone-100 px-1 rounded">VITE_SUPABASE_URL</code>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-400'}`}></div>
            <code className="text-sm font-mono bg-stone-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
          </div>
        </div>
        <p className="text-xs text-stone-400">
           如果在 GitHub Codespaces，請重啟容器確保 Secrets 生效。
        </p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.ADMIN:
        return <AdminDashboard store={globalStore} onSelectId={handleIdSelection} />;

      case Screen.LANDING:
        if (activeHistory.length === 0) {
           return (
            <Landing 
              keychainId={activeId || '?'}
              lastHolderName="無（你是第一位）"
              onYes={() => alert('既然係第一位，請選擇「唔係」來開始旅程！')} 
              onNo={() => setCurrentScreen(Screen.NEW_INPUT)}
            />
           );
        }
        return (
          <Landing 
            keychainId={activeId || '?'}
            lastHolderName={lastHolderName}
            onYes={() => setCurrentScreen(Screen.RETURNING)}
            onNo={() => setCurrentScreen(Screen.NEW_INPUT)}
          />
        );
      
      case Screen.RETURNING:
        return <Returning onViewHistory={() => setCurrentScreen(Screen.HISTORY)} />;
      
      case Screen.NEW_INPUT:
        return <NewInput onSubmit={handleNewHolderSubmit} />;

      case Screen.EXPLANATION:
        if (!currentExplanationData) return null;
        return (
          <Explanation
            currentName={currentNewHolderName}
            giverName={currentExplanationData.giverName}
            previousPromptText={currentExplanationData.previousPromptText}
            nextPromptText={currentExplanationData.nextPromptText}
            onViewHistory={() => setCurrentScreen(Screen.HISTORY)}
          />
        );

      case Screen.HISTORY:
        return <HistoryView events={activeHistory} onBackHome={handleBackToAdmin} />;

      default:
        return <div>Error: Unknown screen</div>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100">
      <div className={`${currentScreen === Screen.ADMIN ? 'max-w-5xl' : 'max-w-md'} mx-auto px-6 py-6 min-h-screen flex flex-col`}>
        {renderScreen()}
      </div>
      
      {/* Connection Status Indicator */}
      <div className="fixed bottom-2 right-2 flex items-center gap-2 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-md shadow-sm font-medium border border-green-200">
            ☁️ Supabase Active
        </span>
      </div>
    </div>
  );
}

export default App;
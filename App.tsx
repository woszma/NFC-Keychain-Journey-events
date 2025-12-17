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
  
  // New state to track if we are in offline/demo mode due to errors
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!isSupabaseConfigured);

  // Temporary state for the flow
  const [currentNewHolderName, setCurrentNewHolderName] = useState<string>('');
  const [currentExplanationData, setCurrentExplanationData] = useState<{
    giverName: string;
    previousPromptText: string;
    nextPromptText: string;
  } | null>(null);

  // --- DATABASE FUNCTIONS ---

  const fetchEvents = async () => {
    setIsLoading(true);
    
    // 如果環境變數本身沒設定，直接進入離線模式
    if (!isSupabaseConfigured) {
        setIsOfflineMode(true);
        setIsLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        // 如果是資料表不存在 (PGRST205) 或連線問題，切換到離線模式，不要讓 App 崩潰
        if (error.code === 'PGRST205' || error.code === '42P01') {
           console.warn('⚠️ 資料表 "events" 不存在。App 將以 Demo 模式執行，資料不會儲存。');
           setIsOfflineMode(true);
        } else {
           throw error;
        }
      } else {
        // 成功連線且讀取到資料
        setIsOfflineMode(false);
        
        // Group by keychain_id
        const store: GlobalStore = {};
        if (data) {
          data.forEach((event: any) => {
            const kId = event.keychain_id;
            if (!store[kId]) store[kId] = [];
            store[kId].push(event);
          });
        }
        setGlobalStore(store);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      // 發生其他錯誤時，也切換到離線模式以保護使用者體驗
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEventToCloud = async (event: HistoryEvent) => {
    // 如果已經是離線模式，跳過儲存
    if (isOfflineMode) {
        console.log('Demo 模式：模擬儲存成功 (資料僅在本地記憶體)', event);
        return;
    }

    const { error } = await supabase
      .from('events')
      .insert([event]);
    
    if (error) {
      console.error('Error saving to Supabase:', error);
      // 這裡不使用 alert，避免打斷使用者體驗，改為 console log
      console.warn('儲存失敗，可能因網路問題或資料庫設定錯誤');
    }
  };

  // --------------------------

  // 1. Initialize Route & Data
  useEffect(() => {
    fetchEvents();

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
    // Refresh data only if we are connected and online
    if (!isOfflineMode) {
        fetchEvents(); 
    }
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

    // 4. Update UI Optimistically (Immediate Feedback)
    const newHistory = [...activeHistory, newEvent];
    const newStore = { ...globalStore, [activeId]: newHistory };
    setGlobalStore(newStore);

    // 5. Save to Cloud (or Mock)
    await saveEventToCloud(newEvent);

    // 6. Update Local State & Navigate
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
                <div className="text-stone-400 font-medium">載入中...</div>
            </div>
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
      <div className="fixed bottom-2 right-2 flex items-center gap-2 pointer-events-none">
        {isOfflineMode ? (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] rounded-md shadow-sm font-medium">
               ⚠️ Demo Mode (Table Not Found)
            </span>
        ) : (
            <span className="text-[10px] text-stone-300">
               Cloud Connected
            </span>
        )}
      </div>
    </div>
  );
}

export default App;
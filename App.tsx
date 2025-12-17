import React, { useState, useEffect } from 'react';
import { Screen, HistoryEvent, GlobalStore } from './types';
import { PROMPT_POOL, INITIAL_HISTORY_SEED } from './constants';
import { Landing } from './components/screens/Landing';
import { Returning } from './components/screens/Returning';
import { NewInput } from './components/screens/NewInput';
import { Explanation } from './components/screens/Explanation';
import { HistoryView } from './components/screens/History';
import { AdminDashboard } from './components/screens/AdminDashboard';

// --- SIMULATED DATABASE SERVICE LAYER ---
// In a real app, replace these functions with Firebase/Supabase calls.

const STORAGE_KEY = 'nfc_keychain_global_store';

const fetchAllData = (): GlobalStore => {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) {
    // Initialize with some dummy data for Demo purposes
    const initialStore: GlobalStore = {
      "0": INITIAL_HISTORY_SEED,
      "8": [
        { ...INITIAL_HISTORY_SEED[0], id: 'demo-8', toName: '嘉嘉', timestamp: Date.now() - 50000000 },
        { 
          id: 'demo-9', 
          timestamp: Date.now() - 100000, 
          fromName: '嘉嘉', 
          toName: 'Eric', 
          promptKey: 'MOST_WORRIED', 
          promptText: '最擔心嘅人',
          nextPromptKey: 'FAVORITE_PERSON',
          nextPromptText: '最喜歡嘅人'
        }
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
    return initialStore;
  }
  return JSON.parse(json);
};

const saveDataToStore = (newStore: GlobalStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
};

// ----------------------------------------

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);
  
  // App Data State
  const [globalStore, setGlobalStore] = useState<GlobalStore>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // Temporary state for the flow
  const [currentNewHolderName, setCurrentNewHolderName] = useState<string>('');
  const [currentExplanationData, setCurrentExplanationData] = useState<{
    giverName: string;
    previousPromptText: string;
    nextPromptText: string;
  } | null>(null);

  // 1. Initialize Route & Data
  useEffect(() => {
    // Load Database
    const data = fetchAllData();
    setGlobalStore(data);

    // Check URL for ID
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');

    if (idFromUrl) {
      // Validate ID (0-99)
      const numId = parseInt(idFromUrl, 10);
      if (!isNaN(numId) && numId >= 0 && numId <= 99) {
        setActiveId(idFromUrl);
        setCurrentScreen(Screen.LANDING);
      } else {
        // Invalid ID, go to Admin
        window.history.replaceState(null, '', '/');
        setCurrentScreen(Screen.ADMIN);
      }
    } else {
      // No ID, go to Admin
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
        timestamp: Date.now(),
        fromName: '大象工廠',
        toName: '未啟動',
        promptKey: 'START',
        promptText: '旅程開始',
        nextPromptKey: 'START',
        nextPromptText: '第一位主人'
      }; // Fallback for empty new keychains

  const lastHolderName = activeHistory.length > 0 ? lastEvent.toName : '沒有人';

  // --- Handlers ---

  const handleIdSelection = (id: string) => {
    setActiveId(id);
    // Update URL without reloading
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setCurrentScreen(Screen.LANDING);
  };

  const handleBackToAdmin = () => {
    setActiveId(null);
    const newUrl = window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setCurrentScreen(Screen.ADMIN);
  };

  const handleNewHolderSubmit = (name: string) => {
    if (!activeId) return;

    // Logic: If this is the VERY FIRST person (history empty), the logic is slightly different
    const isFirst = activeHistory.length === 0;

    // 1. Pick next prompt
    const randomIndex = Math.floor(Math.random() * PROMPT_POOL.length);
    const nextPrompt = PROMPT_POOL[randomIndex];

    // 2. Determine "Why I received it"
    const reasonIReceivedIt = isFirst 
      ? '這是一次偶然的相遇' 
      : (lastEvent.nextPromptText || '命運的安排');

    // 3. Create Event
    const newEvent: HistoryEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      fromName: isFirst ? '大象女士' : lastHolderName,
      toName: name,
      promptKey: isFirst ? 'START' : (lastEvent.nextPromptKey || 'UNKNOWN'),
      promptText: reasonIReceivedIt,
      nextPromptKey: nextPrompt.key,
      nextPromptText: nextPrompt.text
    };

    // 4. Update Global Store
    const newHistory = [...activeHistory, newEvent];
    const newStore = {
      ...globalStore,
      [activeId]: newHistory
    };

    setGlobalStore(newStore);
    saveDataToStore(newStore); // Sync to DB

    // 5. Update Local State
    setCurrentNewHolderName(name);
    setCurrentExplanationData({
      giverName: isFirst ? '大象女士' : lastHolderName,
      previousPromptText: reasonIReceivedIt,
      nextPromptText: nextPrompt.text
    });

    // 6. Navigate
    setCurrentScreen(Screen.EXPLANATION);
  };

  // --- Render Logic ---

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.ADMIN:
        return (
          <AdminDashboard 
            store={globalStore} 
            onSelectId={handleIdSelection} 
          />
        );

      case Screen.LANDING:
        // Handle case where ID is selected but no history yet
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
        return (
          <Returning 
            onViewHistory={() => setCurrentScreen(Screen.HISTORY)} 
          />
        );
      
      case Screen.NEW_INPUT:
        return (
          <NewInput 
            onSubmit={handleNewHolderSubmit} 
          />
        );

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
        return (
          <HistoryView 
            events={activeHistory} 
            onBackHome={handleBackToAdmin}
          />
        );

      default:
        return <div>Error: Unknown screen</div>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100">
      <div className={`${currentScreen === Screen.ADMIN ? 'max-w-5xl' : 'max-w-md'} mx-auto px-6 py-6 min-h-screen flex flex-col`}>
        {renderScreen()}
      </div>
      
      {/* Footer for Dev Context */}
      <div className="fixed bottom-2 right-2 opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] bg-stone-200 px-2 py-1 rounded text-stone-500">
           {activeId ? `Keychain #${activeId}` : 'Admin View'}
        </span>
      </div>
    </div>
  );
}

export default App;
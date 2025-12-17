import React from 'react';
import { HistoryEvent, GlobalStore } from '../../types';
import { ArrowRight, Map } from 'lucide-react';

interface AdminDashboardProps {
  store: GlobalStore;
  onSelectId: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ store, onSelectId }) => {
  // Create an array of 0-99
  const allIds = Array.from({ length: 100 }, (_, i) => i.toString());

  // Calculate stats
  const activeCount = Object.keys(store).length;
  const totalSteps = Object.values(store).reduce((acc, events) => acc + events.length, 0);

  return (
    <div className="min-h-screen py-8 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-stone-200 rounded-full mb-2">
            <Map className="w-6 h-6 text-stone-700" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">大象女士的旅程地圖</h1>
          <p className="text-stone-500">目前有 {activeCount} 隻大象正在流浪，共 {totalSteps} 站旅程。</p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-stone-500 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-200 rounded-full"></div>
            <span>旅途中 (Active)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-stone-100 border border-stone-200 rounded-full"></div>
            <span>未啟動 (Waiting)</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {allIds.map((id) => {
            const events = store[id] || [];
            const isActive = events.length > 0;
            const lastHolder = isActive ? events[events.length - 1].toName : null;

            return (
              <button
                key={id}
                onClick={() => onSelectId(id)}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200
                  ${isActive 
                    ? 'bg-white border-2 border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-amber-400' 
                    : 'bg-stone-50 border border-stone-100 text-stone-300 hover:border-stone-300 hover:text-stone-400'}
                `}
              >
                <span className={`text-lg font-bold ${isActive ? 'text-stone-800' : 'text-inherit'}`}>
                  {id}
                </span>
                {isActive && (
                  <span className="text-[10px] text-stone-500 truncate w-full text-center mt-1">
                    {lastHolder}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
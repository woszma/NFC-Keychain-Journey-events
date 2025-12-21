import React from 'react';
import { Button } from '../Button';
import { History, Gift } from 'lucide-react';

interface ExplanationProps {
  currentName: string;
  giverName: string;
  previousPromptText: string;
  nextPromptText: string;
  onViewHistory: () => void;
}

export const Explanation: React.FC<ExplanationProps> = ({
  currentName,
  giverName,
  previousPromptText,
  nextPromptText,
  onViewHistory
}) => {
  return (
    <div className="flex flex-col min-h-[80vh] py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Context Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide">點解小將會嚟到你手上？</h3>
        <p className="text-stone-800 text-lg leading-relaxed">
          因為我曾經留低一句暗號俾 <span className="font-bold text-stone-900 border-b-2 border-amber-200">{giverName}</span>：
        </p>
        <div className="pl-4 border-l-4 border-stone-200 py-1">
          <p className="text-stone-600 italic">
            「請你把呢個鎖匙扣，交畀你最信任嘅人。等小將認識到佢。」
          </p>
        </div>
        <p className="text-stone-800 text-lg">
          於是，小將就循住呢條線，遇見咗你。<br/>
        </p>
        <p className="text-stone-600">記錄已接上：你好，<span className="font-bold">{currentName}</span>。</p>
      </div>

      {/* The Request Section */}
      <div className="bg-stone-900 text-stone-50 p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gift className="w-24 h-24" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <h3 className="text-amber-200 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            我可以委託你接下一段任務（Quest）嗎？
          </h3>
          
          <p className="text-xl font-medium leading-relaxed">
            請你把呢個鎖匙扣，<br/>
            交畀你
            <span className="text-amber-300 font-bold text-2xl block my-2">最近令你大笑嘅人</span>。
          </p>
          
          <p className="text-stone-400 text-sm">
            你可以只寫代號／關係（Nickname / Alias）。<br/>
            送出之後，返嚟更新下一站，旅程就會繼續。
          </p>
        </div>
      </div>

      <div className="pt-4 pb-12">
        <Button onClick={onViewHistory} variant="outline" fullWidth className="bg-white hover:bg-stone-50">
          <History className="w-4 h-4 mr-2" />
          查看小將足跡
        </Button>
      </div>
    </div>
  );
};
import React from 'react';
import { Button } from '../Button';
import { History } from 'lucide-react';

interface ReturningProps {
  onViewHistory: () => void;
}

export const Returning: React.FC<ReturningProps> = ({ onViewHistory }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
        <span className="text-4xl">👋</span>
      </div>

      <div className="text-center space-y-4 max-w-xs">
        <h2 className="text-3xl font-bold text-stone-800">歡迎返嚟，冒險者。</h2>
        <p className="text-stone-600 leading-relaxed">
          你而家係呢個小將鎖匙扣嘅其中一位持有人。<br/>
          想睇佢行到邊？隨時返嚟翻閱足跡（Trail）。
        </p>
      </div>

      <div className="w-full max-w-sm pt-8">
        <Button onClick={onViewHistory} variant="primary" fullWidth className="flex items-center justify-center gap-2">
          <History className="w-5 h-5" />
          查看小將足跡
        </Button>
      </div>
    </div>
  );
};
import React from 'react';
import { Button } from '../Button';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface LandingProps {
  keychainId: string;
  lastHolderName: string;
  onYes: () => void;
  onNo: () => void;
}

export const Landing: React.FC<LandingProps> = ({ keychainId, lastHolderName, onYes, onNo }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 bg-stone-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <span className="text-6xl">🐘</span>
        </div>
        <div className="absolute -top-2 -right-2 bg-stone-800 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-stone-50">
          ID #{keychainId}
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 leading-snug">
          象群記錄：你接到小將（ID #{""}
          {keychainId}
          ）了嗎？
        </h1>
        <p className="text-stone-500 text-sm">
          回覆一聲，等旅程唔會斷線。
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 pt-8">
          <Button onClick={onYes} variant="outline" fullWidth className="flex items-center justify-center gap-2 h-auto py-4 text-left">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="font-bold">係，我係上一站守護者</span>
            <span className="text-xs opacity-70 font-normal">我係：{lastHolderName}</span>
          </div>
        </Button>

        <Button onClick={onNo} variant="primary" fullWidth className="flex items-center justify-center gap-2 h-auto py-4 text-left">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="font-bold">唔係，我係新加入嘅冒險者</span>
            <span className="text-xs opacity-80 font-normal">由 {lastHolderName} 交到我手</span>
          </div>
        </Button>
      </div>
      
      <div className="flex items-center text-stone-400 text-xs gap-1">
        <HelpCircle className="w-3 h-3" />
        <span>名字可以用暱稱／代號（Nickname / Alias）</span>
      </div>
    </div>
  );
};
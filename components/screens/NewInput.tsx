import React, { useState } from 'react';
import { Button } from '../Button';
import { ArrowRight, UserPlus } from 'lucide-react';

interface NewInputProps {
  onSubmit: (name: string) => void;
}

export const NewInput: React.FC<NewInputProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      onSubmit(name);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col justify-center min-h-[70vh] space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="space-y-2">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">新旅伴，留個稱呼？</h2>
        <p className="text-stone-500 text-sm">你想點樣被象群記錄都得。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
            名字／暱稱
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：阿明、Daisy、同學B、教練…"
            className="w-full px-4 py-4 text-lg bg-white border-2 border-stone-200 rounded-xl focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors placeholder:text-stone-300"
            autoFocus
            maxLength={20}
          />
          <p className="text-xs text-stone-400 mt-1">唔使真名；代號都可以。</p>
        </div>

        <Button 
          type="submit" 
          disabled={!name.trim() || isSubmitting} 
          fullWidth 
          variant="primary"
          className="flex items-center justify-center gap-2"
        >
          {isSubmitting ? '記錄中...' : '確認並啟程 →'}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
};
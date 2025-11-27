import React, { useState, KeyboardEvent } from 'react';
import { Sparkles, Plus, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onAddSimple: (text: string) => void;
  onAddSmart: (text: string) => Promise<void>;
  isProcessing: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onAddSimple, onAddSmart, isProcessing }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitSimple();
    }
  };

  const handleSubmitSimple = () => {
    if (inputValue.trim()) {
      onAddSimple(inputValue);
      setInputValue('');
    }
  };

  const handleSubmitSmart = async () => {
    if (inputValue.trim()) {
      await onAddSmart(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe shadow-lg z-50">
      <div className="max-w-md mx-auto flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item or recipe (e.g. 'Milk, Eggs, Bread')"
            className="w-full pl-4 pr-10 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-800 placeholder-slate-400"
            disabled={isProcessing}
          />
        </div>

        {/* Smart Add Button (Gemini) */}
        <button
          onClick={handleSubmitSmart}
          disabled={!inputValue.trim() || isProcessing}
          className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center
            ${inputValue.trim() && !isProcessing 
              ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-indigo-200 hover:scale-105 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          aria-label="Smart Add"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
        </button>
        
        {/* Simple Add Button */}
         <button
          onClick={handleSubmitSimple}
          disabled={!inputValue.trim() || isProcessing}
          className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center
            ${inputValue.trim() && !isProcessing 
              ? 'bg-slate-800 text-white shadow-md hover:bg-slate-700 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          aria-label="Add Item"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="text-center text-xs text-slate-400 mt-2">
        Tip: Try typing "Pizza ingredients" and tap the ✨ button.
      </div>
    </div>
  );
};
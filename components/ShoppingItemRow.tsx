import React from 'react';
import { ShoppingItem } from '../types';
import { Check, Trash2, RotateCcw } from 'lucide-react';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({ item, onToggle, onDelete }) => {
  return (
    <div 
      className={`group flex items-center justify-between p-3 mb-2 rounded-xl transition-all duration-300 border
        ${item.isBought 
          ? 'bg-slate-50 border-transparent opacity-60' 
          : 'bg-white border-slate-100 shadow-sm hover:border-indigo-100'}`}
    >
      <div 
        className="flex items-center flex-1 cursor-pointer" 
        onClick={() => onToggle(item.id)}
      >
        <div 
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors duration-200
            ${item.isBought 
              ? 'bg-green-500 border-green-500' 
              : 'border-slate-300 group-hover:border-indigo-400'}`}
        >
          {item.isBought && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        
        <div className="flex flex-col">
          <span 
            className={`text-base font-medium transition-all duration-200 
              ${item.isBought ? 'text-slate-400 line-through' : 'text-slate-800'}`}
          >
            {item.name}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {item.category}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="p-2 text-slate-300 hover:text-red-400 transition-colors focus:outline-none opacity-0 group-hover:opacity-100 active:opacity-100" // Always visible on mobile tap effectively, but cleaner UI
        aria-label="Delete item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
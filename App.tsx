import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingItem, GroupedItems } from './types';
import { InputArea } from './components/InputArea';
import { ShoppingItemRow } from './components/ShoppingItemRow';
import { parseAndOrganizeList } from './services/geminiService';
import { ShoppingCart, PieChart, Trash2, ListChecks, ArrowDownUp, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'smartshop_items_v1';

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleAddSimple = (text: string) => {
    const newItems = text.split(',').map(t => t.trim()).filter(Boolean).map(name => ({
      id: crypto.randomUUID(),
      name: name,
      isBought: false,
      category: 'General'
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleAddSmart = async (text: string) => {
    setIsProcessing(true);
    try {
      const parsedItems = await parseAndOrganizeList(text);
      const newItems: ShoppingItem[] = parsedItems.map(item => ({
        id: crypto.randomUUID(),
        name: item.name,
        isBought: false,
        category: item.category
      }));
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      console.error(err);
      // Fallback handled in service, but just in case
      handleAddSimple(text);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (id: string) => {
    // Vibrate for feedback on mobile
    if (navigator.vibrate) navigator.vibrate(10);
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    if (confirm('Remove all bought items?')) {
      setItems(prev => prev.filter(item => !item.isBought));
    }
  };
  
  const resetList = () => {
    if (confirm('Delete entire list?')) {
      setItems([]);
    }
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: GroupedItems = {};
    const itemsToShow = viewMode === 'pending' ? items.filter(i => !i.isBought) : items;

    // Sort: Pending first, then Bought
    const sortedItems = [...itemsToShow].sort((a, b) => {
      if (a.isBought === b.isBought) return 0;
      return a.isBought ? 1 : -1;
    });

    sortedItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [items, viewMode]);

  const totalItems = items.length;
  const boughtItems = items.filter(i => i.isBought).length;
  const progress = totalItems === 0 ? 0 : Math.round((boughtItems / totalItems) * 100);

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              SmartShop
            </h1>
          </div>
          
          <div className="flex gap-2">
             <button 
              onClick={() => setViewMode(prev => prev === 'all' ? 'pending' : 'all')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'pending' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Toggle View Mode"
            >
              <ListChecks className="w-5 h-5" />
            </button>
            <button 
              onClick={clearCompleted}
              disabled={boughtItems === 0}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
              title="Clear Completed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="h-1 w-full bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4">
        
        {/* Stats Card */}
        {totalItems > 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Shopping Progress</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{boughtItems}</span>
                <span className="text-sm text-slate-400">/ {totalItems} items</span>
              </div>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <PieChart className="w-full h-full text-slate-100 absolute" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-emerald-500 opacity-20"
              ></div>
               <span className="text-xs font-bold text-emerald-600">{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-center px-6">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Your list is empty</h2>
            <p className="text-slate-400 mb-6">
              Add items manually or use the AI magic button to plan a recipe or organize a messy list instantly.
            </p>
          </div>
        )}

        {/* List Groups */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
             if (categoryItems.length === 0) return null;
             
             return (
              <div key={category} className="animate-fade-in">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-2">
                  {category}
                  <span className="bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md text-[10px]">
                    {categoryItems.length}
                  </span>
                </h3>
                <div className="space-y-0">
                  {categoryItems.map(item => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Spacer for sticky footer */}
        <div className="h-24"></div>
      </main>

      <InputArea 
        onAddSimple={handleAddSimple}
        onAddSmart={handleAddSmart}
        isProcessing={isProcessing}
      />
    </div>
  );
}
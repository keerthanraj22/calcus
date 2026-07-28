import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Star, 
  Copy, 
  Download, 
  Search, 
  ArrowUpRight,
  Clock,
  Check
} from 'lucide-react';
import { HistoryItem } from '../types';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectExpression: (expr: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onToggleFavorite,
  onSelectExpression,
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.expression.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase());
    const matchesFav = !filterFavorites || item.isFavorite;
    return matchesSearch && matchesFav;
  });

  const handleCopy = (id: string, text: string) => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJSON = () => {
    sounds.playKeyClick();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcus-history-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col h-[82vh] max-h-[640px]">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-white">Calculation History</h2>
          </div>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex items-center gap-2 py-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              filterFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="Filter Favorites"
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleExportJSON}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Export History JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sounds.playClearTone();
              onClearHistory();
            }}
            className="p-2 rounded-lg bg-slate-950 hover:bg-rose-500/20 text-rose-400 border border-slate-800 transition-colors"
            title="Clear All History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* HISTORY LIST */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 my-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center py-8">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <p>No calculation history recorded yet.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                    {item.category || 'General'}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="font-mono text-xs text-slate-300 truncate">
                  {item.expression}
                </div>

                <div className="font-mono text-sm font-bold text-cyan-300 flex items-center justify-between mt-0.5">
                  <span className="truncate">= {item.result}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          item.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, `${item.expression} = ${item.result}`)}
                      className="p-1 text-slate-500 hover:text-white transition-colors"
                      title="Copy to Clipboard"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        sounds.playKeyClick();
                        onSelectExpression(item.expression);
                        onClose();
                      }}
                      className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Insert into Calculator"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

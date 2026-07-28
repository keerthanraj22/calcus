import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, RotateCcw, Sparkles, CornerDownLeft } from 'lucide-react';
import { AngleUnit } from '../types';
import { sounds } from '../utils/audio';
import { KaTeXView } from './KaTeXView';

interface CalculatorKeypadProps {
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  resultPreview: string;
  onEvaluate: () => void;
  angleUnit: AngleUnit;
  onToggleAngleUnit: () => void;
  memoryValue: number;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySub: () => void;
  onAskAIForHelp: (expr: string) => void;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  expression,
  setExpression,
  resultPreview,
  onEvaluate,
  angleUnit,
  onToggleAngleUnit,
  memoryValue,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySub,
  onAskAIForHelp,
}) => {
  const [isScientific, setIsScientific] = useState<boolean>(true);
  const [isShift, setIsShift] = useState<boolean>(false);
  const [particleActive, setParticleActive] = useState<boolean>(false);

  // Key press handlers
  const handleCharInput = (char: string) => {
    sounds.playKeyClick(1.0);
    setExpression((prev) => prev + char);
  };

  const handleClear = () => {
    sounds.playClearTone();
    setExpression('');
  };

  const handleDelete = () => {
    sounds.playKeyClick(0.8);
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEquals = () => {
    if (!expression) return;
    sounds.playEqualsSuccess();
    setParticleActive(true);
    setTimeout(() => setParticleActive(false), 600);
    onEvaluate();
  };

  const handleToggleSign = () => {
    sounds.playKeyClick(0.9);
    if (!expression) {
      setExpression('-');
      return;
    }
    if (expression.startsWith('-')) {
      setExpression(expression.slice(1));
    } else {
      setExpression('-' + expression);
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field elsewhere
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '0' && e.key <= '9') handleCharInput(e.key);
      else if (e.key === '.') handleCharInput('.');
      else if (e.key === '+') handleCharInput('+');
      else if (e.key === '-') handleCharInput('−');
      else if (e.key === '*') handleCharInput('×');
      else if (e.key === '/') {
        e.preventDefault();
        handleCharInput('÷');
      } else if (e.key === '(') handleCharInput('(');
      else if (e.key === ')') handleCharInput(')');
      else if (e.key === '^') handleCharInput('^');
      else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression]);

  return (
    <div className="w-full flex flex-col h-full select-none bg-slate-950 text-white relative overflow-hidden">
      {/* Particle Effect Burst Overlay on Equals */}
      <AnimatePresence>
        {particleActive && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-cyan-500/30 blur-2xl pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* LCD DISPLAY SCREEN */}
      <div className="p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/95 border-b border-slate-800/80 flex flex-col justify-end min-h-[160px] relative shadow-inner">
        {/* Top Indicators */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playKeyClick(1.1);
                onToggleAngleUnit();
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold border border-slate-700 transition-colors"
            >
              {angleUnit.toUpperCase()}
            </button>
            <button
              onClick={() => setIsScientific(!isScientific)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 transition-colors"
            >
              {isScientific ? 'Sci Mode' : 'Basic'}
            </button>
            {memoryValue !== 0 && (
              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                M
              </span>
            )}
          </div>

          {/* AI Helper Quick Trigger */}
          {expression.trim().length > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => onAskAIForHelp(expression)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[11px] shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span>Solve with AI</span>
            </motion.button>
          )}
        </div>

        {/* Math Expression Output */}
        <div className="w-full text-right overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none py-1">
          <span className="font-mono text-2xl sm:text-3xl tracking-wide text-slate-200">
            {expression || <span className="text-slate-600">0</span>}
          </span>
        </div>

        {/* Live Result Preview */}
        <div className="w-full text-right h-10 flex items-center justify-end overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={resultPreview || 'empty'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-mono text-xl sm:text-2xl font-bold text-cyan-400 tracking-tight"
            >
              {resultPreview ? `= ${resultPreview}` : ''}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* KEYPAD GRID */}
      <div className="flex-1 p-3 bg-slate-950 grid grid-cols-4 gap-2 text-sm font-semibold select-none overflow-y-auto">
        {/* SCIENTIFIC FUNCTION ROW 1 */}
        {isScientific && (
          <>
            <button
              onClick={() => setIsShift(!isShift)}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isShift
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-slate-800'
              }`}
            >
              2nd
            </button>
            <button
              onClick={() => handleCharInput(isShift ? 'asin(' : 'sin(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              {isShift ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              onClick={() => handleCharInput(isShift ? 'acos(' : 'cos(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              {isShift ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              onClick={() => handleCharInput(isShift ? 'atan(' : 'tan(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              {isShift ? 'tan⁻¹' : 'tan'}
            </button>

            {/* SCIENTIFIC ROW 2 */}
            <button
              onClick={() => handleCharInput(isShift ? '10^(' : 'log(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              {isShift ? '10ˣ' : 'log'}
            </button>
            <button
              onClick={() => handleCharInput(isShift ? 'e^(' : 'ln(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              {isShift ? 'eˣ' : 'ln'}
            </button>
            <button
              onClick={() => handleCharInput('^')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              xʸ
            </button>
            <button
              onClick={() => handleCharInput('sqrt(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-xs transition-all active:scale-95 border border-slate-800"
            >
              √
            </button>

            {/* SCIENTIFIC ROW 3 (Constants & Bracket) */}
            <button
              onClick={() => handleCharInput('π')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 font-mono text-sm transition-all active:scale-95 border border-slate-800"
            >
              π
            </button>
            <button
              onClick={() => handleCharInput('e')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 font-mono text-sm transition-all active:scale-95 border border-slate-800"
            >
              e
            </button>
            <button
              onClick={() => handleCharInput('(')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-sm transition-all active:scale-95 border border-slate-800"
            >
              (
            </button>
            <button
              onClick={() => handleCharInput(')')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 font-mono text-sm transition-all active:scale-95 border border-slate-800"
            >
              )
            </button>
          </>
        )}

        {/* STANDARD CONTROLS ROW */}
        <button
          onClick={handleClear}
          className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-sm transition-all active:scale-95 border border-rose-500/30 flex items-center justify-center"
        >
          AC
        </button>
        <button
          onClick={handleDelete}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all active:scale-95 border border-slate-800 flex items-center justify-center"
        >
          <Delete className="w-5 h-5 text-slate-300" />
        </button>
        <button
          onClick={() => handleCharInput('%')}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-sm transition-all active:scale-95 border border-slate-800"
        >
          %
        </button>
        <button
          onClick={() => handleCharInput('÷')}
          className="p-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-lg transition-all active:scale-95 border border-cyan-500/30"
        >
          ÷
        </button>

        {/* NUMPAD 7, 8, 9, × */}
        <button
          onClick={() => handleCharInput('7')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          7
        </button>
        <button
          onClick={() => handleCharInput('8')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          8
        </button>
        <button
          onClick={() => handleCharInput('9')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          9
        </button>
        <button
          onClick={() => handleCharInput('×')}
          className="p-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-lg transition-all active:scale-95 border border-cyan-500/30"
        >
          ×
        </button>

        {/* NUMPAD 4, 5, 6, − */}
        <button
          onClick={() => handleCharInput('4')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          4
        </button>
        <button
          onClick={() => handleCharInput('5')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          5
        </button>
        <button
          onClick={() => handleCharInput('6')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          6
        </button>
        <button
          onClick={() => handleCharInput('−')}
          className="p-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-lg transition-all active:scale-95 border border-cyan-500/30"
        >
          −
        </button>

        {/* NUMPAD 1, 2, 3, + */}
        <button
          onClick={() => handleCharInput('1')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          1
        </button>
        <button
          onClick={() => handleCharInput('2')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          2
        </button>
        <button
          onClick={() => handleCharInput('3')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          3
        </button>
        <button
          onClick={() => handleCharInput('+')}
          className="p-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-lg transition-all active:scale-95 border border-cyan-500/30"
        >
          +
        </button>

        {/* BOTTOM ROW: ±, 0, ., = */}
        <button
          onClick={handleToggleSign}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-base transition-all active:scale-95 border border-slate-800/80"
        >
          ±
        </button>
        <button
          onClick={() => handleCharInput('0')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-lg transition-all active:scale-95 border border-slate-800/80 shadow-sm"
        >
          0
        </button>
        <button
          onClick={() => handleCharInput('.')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-lg transition-all active:scale-95 border border-slate-800/80"
        >
          .
        </button>

        {/* EQUALS BUTTON */}
        <button
          onClick={handleEquals}
          className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95 flex items-center justify-center"
        >
          =
        </button>
      </div>
    </div>
  );
};

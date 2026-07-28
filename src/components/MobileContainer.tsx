import React from 'react';
import { 
  Calculator, 
  LineChart, 
  Binary, 
  Sparkles, 
  BookOpen, 
  GraduationCap,
  Lightbulb
} from 'lucide-react';
import { CalculatorMode } from '../types';
import { sounds } from '../utils/audio';

interface MobileContainerProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
  activeMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  isMobileFrame,
  activeMode,
  onSelectMode,
}) => {
  const tabs = [
    { id: 'basic' as CalculatorMode, label: 'Calc', icon: Calculator },
    { id: 'learn' as CalculatorMode, label: 'Learn', icon: Lightbulb, highlight: true },
    { id: 'equations' as CalculatorMode, label: 'Solver', icon: Binary },
    { id: 'ai' as CalculatorMode, label: 'Calcus AI', icon: Sparkles },
    { id: 'graphing' as CalculatorMode, label: 'Graph', icon: LineChart },
    { id: 'formulas' as CalculatorMode, label: 'Formulas', icon: BookOpen },
    { id: 'quiz' as CalculatorMode, label: 'Quiz', icon: GraduationCap },
  ];

  const handleTabClick = (mode: CalculatorMode) => {
    sounds.playKeyClick(1.0);
    onSelectMode(mode);
  };

  const containerContent = (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Main View Area */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Bottom Mobile Tab Navigation Bar */}
      <nav className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-1 py-1.5 flex items-center justify-around z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeMode === tab.id ||
            (activeMode === 'scientific' && tab.id === 'basic');

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 font-bold border border-purple-500/30 shadow-sm scale-105'
                    : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? tab.highlight
                      ? 'text-purple-300'
                      : 'text-cyan-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  if (!isMobileFrame) {
    return (
      <div className="w-full h-screen max-w-5xl mx-auto flex flex-col bg-slate-950 border-x border-slate-800/80 shadow-2xl overflow-hidden">
        {containerContent}
      </div>
    );
  }

  // Realistic Smartphone Outer Frame
  return (
    <div className="w-full min-h-screen py-4 px-2 bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 border-[10px] border-slate-800/90 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden outline outline-1 outline-slate-700/50">
        {/* Top Smartphone Camera Notch */}
        <div className="w-full h-6 bg-slate-900 flex items-center justify-center pt-1 z-40 select-none">
          <div className="w-28 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          {containerContent}
        </div>

        {/* Bottom Smartphone Indicator Bar */}
        <div className="w-full h-3 bg-slate-900 flex items-center justify-center pb-1">
          <div className="w-28 h-1 bg-slate-600 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Calculator, 
  Sparkles, 
  BookOpen, 
  History, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Maximize2, 
  Palette,
  GraduationCap,
  LineChart,
  Binary
} from 'lucide-react';
import { CalculatorMode, ThemeMode } from '../types';
import { sounds } from '../utils/audio';

interface HeaderBarProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  memoryValue?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentMode,
  onSelectMode,
  isMobileFrame,
  onToggleMobileFrame,
  theme,
  onChangeTheme,
  soundEnabled,
  onToggleSound,
  historyCount,
  onOpenHistory,
  memoryValue = 0,
}) => {
  return (
    <header className="w-full px-3 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-slate-200 select-none z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg tracking-wider font-mono">
              C<span className="text-cyan-400">√</span>
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight text-white leading-none">
              Calcus
            </h1>
            <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Pro AI
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Advanced Math System</p>
        </div>
      </div>

      {/* Quick Status Badges */}
      <div className="hidden sm:flex items-center gap-2">
        {memoryValue !== 0 && (
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            M = {memoryValue}
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* History Button */}
        <button
          onClick={() => {
            sounds.playKeyClick();
            onOpenHistory();
          }}
          className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50"
          title="Calculation History"
        >
          <History className="w-4 h-4 text-cyan-400" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative group">
          <button
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50"
            title="Color Palette"
          >
            <Palette className="w-4 h-4 text-purple-400" />
          </button>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 w-36">
            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Themes</span>
            {(['cyber', 'neoprene', 'amoled', 'sunset', 'paper'] as ThemeMode[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  sounds.playKeyClick();
                  onChangeTheme(t);
                }}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  theme === t ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sounds.playKeyClick();
          }}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50"
          title={soundEnabled ? 'Mute Haptic Audio' : 'Enable Haptic Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Frame Toggle (Smartphone container vs full screen) */}
        <button
          onClick={() => {
            sounds.playKeyClick();
            onToggleMobileFrame();
          }}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50 hidden md:flex"
          title={isMobileFrame ? 'Expand to Responsive Screen' : 'Switch to Smartphone Device Frame'}
        >
          {isMobileFrame ? (
            <Maximize2 className="w-4 h-4 text-blue-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-blue-400" />
          )}
        </button>
      </div>
    </header>
  );
};

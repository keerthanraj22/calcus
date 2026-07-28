import React, { useState, useEffect, useMemo } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { MobileContainer } from './components/MobileContainer';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { GraphingCanvas } from './components/GraphingCanvas';
import { EquationSolver } from './components/EquationSolver';
import { AICanvasSolver } from './components/AICanvasSolver';
import { FormulaVault } from './components/FormulaVault';
import { AIAssessmentQuiz } from './components/AIAssessmentQuiz';
import { LearningCenter } from './components/LearningCenter';
import { HistoryModal } from './components/HistoryModal';
import { CalculatorMode, AngleUnit, ThemeMode, HistoryItem } from './types';
import { evaluateExpression } from './utils/mathEngine';
import { sounds } from './utils/audio';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [activeMode, setActiveMode] = useState<CalculatorMode>('basic');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [theme, setTheme] = useState<ThemeMode>('cyber');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [memoryValue, setMemoryValue] = useState<number>(0);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calcus_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [aiProblemText, setAiProblemText] = useState<string>('');

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('calcus_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Dynamic Live Result Preview
  const resultPreview = useMemo(() => {
    if (!expression || expression.trim() === '') return '';
    const res = evaluateExpression(expression, angleUnit);
    if (res.error) return '';
    return res.result;
  }, [expression, angleUnit]);

  // Evaluate Expression
  const handleEvaluate = () => {
    if (!expression || expression.trim() === '') return;
    const res = evaluateExpression(expression, angleUnit);
    if (res.result && res.result !== 'Error') {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result: res.result,
        timestamp: Date.now(),
        category: 'Calculator',
        isFavorite: false,
      };
      setHistory((prev) => [newItem, ...prev]);
      setExpression(res.result);
    }
  };

  // Memory Handlers
  const handleMemoryClear = () => {
    sounds.playClearTone();
    setMemoryValue(0);
  };

  const handleMemoryRecall = () => {
    sounds.playKeyClick();
    setExpression((prev) => prev + memoryValue.toString());
  };

  const handleMemoryAdd = () => {
    sounds.playKeyClick();
    const res = evaluateExpression(expression, angleUnit);
    if (res.numericValue !== undefined) {
      setMemoryValue((prev) => prev + res.numericValue!);
    }
  };

  const handleMemorySub = () => {
    sounds.playKeyClick();
    const res = evaluateExpression(expression, angleUnit);
    if (res.numericValue !== undefined) {
      setMemoryValue((prev) => prev - res.numericValue!);
    }
  };

  // Save item to history
  const handleSaveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Trigger AI solve with current expression
  const handleAskAIForHelp = (expr: string) => {
    setAiProblemText(expr);
    setActiveMode('ai');
  };

  return (
    <div className={`w-full min-h-screen ${theme === 'paper' ? 'bg-slate-200 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <MobileContainer
        isMobileFrame={isMobileFrame}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
      >
        {/* Header Bar */}
        <HeaderBar
          currentMode={activeMode}
          onSelectMode={setActiveMode}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          theme={theme}
          onChangeTheme={setTheme}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          historyCount={history.length}
          onOpenHistory={() => setIsHistoryOpen(true)}
          memoryValue={memoryValue}
        />

        {/* Dynamic View Switcher */}
        <div className="w-full h-[calc(100%-106px)] relative overflow-hidden">
          {(activeMode === 'basic' || activeMode === 'scientific') && (
            <CalculatorKeypad
              expression={expression}
              setExpression={setExpression}
              resultPreview={resultPreview}
              onEvaluate={handleEvaluate}
              angleUnit={angleUnit}
              onToggleAngleUnit={() => setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg')}
              memoryValue={memoryValue}
              onMemoryClear={handleMemoryClear}
              onMemoryRecall={handleMemoryRecall}
              onMemoryAdd={handleMemoryAdd}
              onMemorySub={handleMemorySub}
              onAskAIForHelp={handleAskAIForHelp}
            />
          )}

          {activeMode === 'graphing' && <GraphingCanvas />}

          {activeMode === 'equations' && <EquationSolver />}

          {activeMode === 'ai' && (
            <AICanvasSolver
              initialProblem={aiProblemText}
              onSaveHistory={handleSaveHistoryItem}
            />
          )}

          {activeMode === 'formulas' && <FormulaVault />}

          {activeMode === 'quiz' && <AIAssessmentQuiz />}

          {activeMode === 'learn' && <LearningCenter />}
        </div>
      </MobileContainer>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onToggleFavorite={handleToggleFavorite}
        onSelectExpression={(expr) => {
          setExpression(expr);
          setActiveMode('basic');
        }}
      />
    </div>
  );
}

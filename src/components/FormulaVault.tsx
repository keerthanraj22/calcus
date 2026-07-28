import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Play, 
  Sparkles, 
  X, 
  Calculator, 
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { MATH_FORMULAS } from '../data/formulas';
import { MathFormula } from '../types';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

export const FormulaVault: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFormula, setActiveFormula] = useState<MathFormula | null>(null);
  const [varInputs, setVarInputs] = useState<Record<string, number>>({});
  const [solvedOutput, setSolvedOutput] = useState<any>(null);

  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const categories = ['All', 'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Finance', 'Physics'];

  const filteredFormulas = MATH_FORMULAS.filter((f) => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open Interactive Formula Solver
  const openSolver = (formula: MathFormula) => {
    sounds.playKeyClick();
    setActiveFormula(formula);
    const defaults: Record<string, number> = {};
    formula.variables.forEach((v) => {
      defaults[v.symbol] = v.defaultValue ?? 1;
    });
    setVarInputs(defaults);

    // Initial calculation
    const initRes = formula.solveFn(defaults);
    setSolvedOutput(initRes);
    setAiExplanation(null);
  };

  const handleInputChange = (symbol: string, val: string) => {
    const num = parseFloat(val);
    const newInputs = { ...varInputs, [symbol]: isNaN(num) ? 0 : num };
    setVarInputs(newInputs);
    if (activeFormula) {
      const res = activeFormula.solveFn(newInputs);
      setSolvedOutput(res);
    }
  };

  // AI Deep Dive
  const handleAiDeepDive = async () => {
    if (!activeFormula) return;
    sounds.playKeyClick();
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/formula-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaName: activeFormula.title,
          latexFormula: activeFormula.latex,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      sounds.playEqualsSuccess();
      setAiExplanation(data.explanation);
    } catch (e) {
      sounds.playErrorTone();
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-3 overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-white">Math Formula Vault</h2>
          <p className="text-[10px] text-slate-400">Interactive Formula Library & Live Solvers</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search formulas (e.g. Quadratic, Circle, Cosines...)"
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* CATEGORY CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sounds.playKeyClick();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FORMULA CARDS GRID */}
      <div className="grid grid-cols-1 gap-2.5 pb-12">
        {filteredFormulas.map((formula) => (
          <div
            key={formula.id}
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {formula.category}
              </span>
              <button
                onClick={() => openSolver(formula)}
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Play className="w-3 h-3 fill-cyan-400" />
                <span>Live Solver</span>
              </button>
            </div>

            <h3 className="font-bold text-sm text-white">{formula.title}</h3>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-cyan-300 text-xs overflow-x-auto">
              <KaTeXView latex={formula.latex} displayMode={true} />
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">{formula.description}</p>
          </div>
        ))}
      </div>

      {/* INTERACTIVE SOLVER MODAL */}
      {activeFormula && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Live Formula Solver
                </span>
                <h3 className="font-bold text-base text-white">{activeFormula.title}</h3>
              </div>
              <button
                onClick={() => setActiveFormula(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Latex Display */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-xs overflow-x-auto">
              <KaTeXView latex={activeFormula.latex} displayMode={true} />
            </div>

            {/* Variable Inputs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Enter Variable Values:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {activeFormula.variables.map((v) => (
                  <div key={v.symbol} className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">
                      {v.label} ({v.symbol})
                    </label>
                    <input
                      type="number"
                      value={varInputs[v.symbol] ?? ''}
                      onChange={(e) => handleInputChange(v.symbol, e.target.value)}
                      className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Solved Output */}
            {solvedOutput && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Computed Step-by-Step Result:
                </span>
                <div className="font-mono text-xs text-slate-200">
                  <KaTeXView latex={solvedOutput.stepLatex} displayMode={true} />
                </div>
              </div>
            )}

            {/* AI Deep Dive Explanation */}
            {!aiExplanation ? (
              <button
                onClick={handleAiDeepDive}
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span>AI Deep Dive Explanation & Real Applications</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-col gap-2 text-xs">
                <span className="font-bold text-purple-300">Overview:</span>
                <p className="text-slate-300">{aiExplanation.overview}</p>

                <span className="font-bold text-purple-300 mt-1">Real-World Applications:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {aiExplanation.realWorldApplications?.map((app: string, idx: number) => (
                    <li key={idx}>{app}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

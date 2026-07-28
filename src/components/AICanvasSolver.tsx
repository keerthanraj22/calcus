import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  PenTool, 
  Eraser, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  Bookmark,
  Loader2
} from 'lucide-react';
import { AISolveResult, HistoryItem } from '../types';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

interface AICanvasSolverProps {
  initialProblem?: string;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export const AICanvasSolver: React.FC<AICanvasSolverProps> = ({
  initialProblem = '',
  onSaveHistory,
}) => {
  const [problemText, setProblemText] = useState<string>(initialProblem);
  const [activeTool, setActiveTool] = useState<'draw' | 'erase'>('draw');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasCanvasDrawing, setHasCanvasDrawing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [solveResult, setSolveResult] = useState<AISolveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.strokeStyle = activeTool === 'draw' ? '#38bdf8' : '#020617';
    ctx.lineWidth = (activeTool === 'draw' ? 3 : 20) * Math.max(scaleX, scaleY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
    if (activeTool === 'draw') setHasCanvasDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sounds.playClearTone();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setHasCanvasDrawing(false);
  };

  // Solve Action with Backend Gemini API
  const handleSolve = async () => {
    if (!problemText.trim() && !hasCanvasDrawing) {
      setError('Please type a math problem or draw on the canvas.');
      return;
    }

    sounds.playKeyClick();
    setLoading(true);
    setError(null);
    setSolveResult(null);

    let imageBase64: string | undefined = undefined;
    if (hasCanvasDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        imageBase64 = canvas.toDataURL('image/png');
      }
    }

    try {
      const response = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText,
          imageBase64,
          mode: 'step-by-step',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to solve problem.');
      }

      sounds.playEqualsSuccess();
      setSolveResult(data.result);

      // Save to history automatically
      onSaveHistory({
        expression: problemText || 'Drawn Math Equation',
        result: data.result.finalAnswer,
        category: data.result.category || 'AI Solve',
        notes: data.result.summary,
        latex: data.result.finalAnswer,
      });
    } catch (err: any) {
      sounds.playErrorTone();
      setError(err.message || 'An error occurred while connecting to Calcus AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-3 overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Calcus AI Math Assistant</h2>
            <p className="text-[10px] text-slate-400">Step-by-Step AI Problem Solver</p>
          </div>
        </div>
      </div>

      {/* INPUT AREA: TEXT & DRAW CANVAS */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">
            Type Math Problem or Word Problem:
          </label>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="e.g. Find derivative of f(x) = x^3 - 4x + 7, or solve integral of sin(x)*cos(x)..."
            rows={2}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* HANDWRITING CANVAS */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Draw Equation or Symbols:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('draw')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
                  activeTool === 'draw'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>
              <button
                onClick={() => setActiveTool('erase')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
                  activeTool === 'erase'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Erase</span>
              </button>
              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-colors"
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={250}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
        </div>

        {/* SOLVE BUTTON */}
        <button
          onClick={handleSolve}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
              <span>Analyzing & Solving Math Problem...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Solve Step-by-Step with Calcus AI</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* AI SOLUTION RESULTS DISPLAY */}
        {solveResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 mt-1 shadow-2xl">
            {/* Header Title */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {solveResult.category || 'Math'}
                </span>
                <h3 className="font-bold text-base text-white mt-1">{solveResult.title}</h3>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              {solveResult.summary}
            </p>

            {/* Final Answer Highlight */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified Final Answer:</span>
              <div className="font-mono text-base font-bold text-emerald-300">
                <KaTeXView latex={solveResult.finalAnswer} displayMode={false} />
              </div>
            </div>

            {/* Step by Step breakdown */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Step-by-Step Derivation:</span>
              </span>

              {solveResult.steps?.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center justify-center border border-cyan-500/30">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-semibold text-xs text-white">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{step.explanation}</p>
                  {step.latex && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto">
                      <KaTeXView latex={step.latex} displayMode={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pro Tips */}
            {solveResult.proTips && (
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex flex-col gap-1">
                <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-400">Pro Tip:</span>
                <p>{solveResult.proTips}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { evaluateExpression } from '../utils/mathEngine';
import { GraphFunction } from '../types';
import { sounds } from '../utils/audio';

const DEFAULT_FUNCTIONS: GraphFunction[] = [
  { id: '1', expression: 'x^2 - 4', color: '#38bdf8', isVisible: true },
  { id: '2', expression: '2 * sin(x)', color: '#c084fc', isVisible: true },
];

export const GraphingCanvas: React.FC = () => {
  const [functions, setFunctions] = useState<GraphFunction[]>(DEFAULT_FUNCTIONS);
  const [newExpr, setNewExpr] = useState<string>('');
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-10);
  const [yMax, setYMax] = useState<number>(10);

  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add Function
  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpr.trim()) return;
    sounds.playKeyClick();
    const colors = ['#38bdf8', '#c084fc', '#f43f5e', '#34d399', '#fbbf24', '#f97316'];
    const newFn: GraphFunction = {
      id: Date.now().toString(),
      expression: newExpr.trim(),
      color: colors[functions.length % colors.length],
      isVisible: true,
    };
    setFunctions([...functions, newFn]);
    setNewExpr('');
  };

  // Toggle Visibility
  const toggleVisibility = (id: string) => {
    sounds.playKeyClick();
    setFunctions(functions.map((f) => (f.id === id ? { ...f, isVisible: !f.isVisible } : f)));
  };

  // Remove Function
  const removeFunction = (id: string) => {
    sounds.playClearTone();
    setFunctions(functions.filter((f) => f.id !== id));
  };

  // Zoom Controls
  const handleZoom = (factor: number) => {
    sounds.playKeyClick();
    setXMin((prev) => prev * factor);
    setXMax((prev) => prev * factor);
    setYMin((prev) => prev * factor);
    setYMax((prev) => prev * factor);
  };

  const handleReset = () => {
    sounds.playKeyClick();
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Coordinate Mappers
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (sx: number) => xMin + (sx / width) * (xMax - xMin);

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '10px monospace';

    // Vertical grid lines
    const xStep = Math.pow(10, Math.floor(Math.log10(xMax - xMin))) / 2 || 1;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
      if (Math.abs(x) > 1e-6) {
        ctx.fillText(x.toFixed(1), sx + 2, toScreenY(0) - 4);
      }
    }

    // Horizontal grid lines
    const yStep = Math.pow(10, Math.floor(Math.log10(yMax - yMin))) / 2 || 1;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
      if (Math.abs(y) > 1e-6) {
        ctx.fillText(y.toFixed(1), toScreenX(0) + 4, sy - 2);
      }
    }

    // Draw X and Y Main Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#475569'; // slate-600
    // X Axis
    const yZero = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(width, yZero);
    ctx.stroke();

    // Y Axis
    const xZero = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, height);
    ctx.stroke();

    // Plot Functions
    functions.forEach((fn) => {
      if (!fn.isVisible) return;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = fn.color;
      ctx.beginPath();

      let isDrawing = false;
      const numPoints = width * 1.5;

      for (let i = 0; i <= numPoints; i++) {
        const sx = (i / numPoints) * width;
        const xVal = toMathX(sx);

        // Replace 'x' in expression with numeric value
        const exprWithX = fn.expression.replace(/x/g, `(${xVal})`);
        const evalRes = evaluateExpression(exprWithX, 'rad');

        if (evalRes.numericValue !== undefined && !isNaN(evalRes.numericValue) && isFinite(evalRes.numericValue)) {
          const sy = toScreenY(evalRes.numericValue);
          if (sy >= -100 && sy <= height + 100) {
            if (!isDrawing) {
              ctx.moveTo(sx, sy);
              isDrawing = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Draw Hover Cursor Line & Coordinates
    if (hoverCoords) {
      const sx = toScreenX(hoverCoords.x);
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [functions, xMin, xMax, yMin, yMax, hoverCoords]);

  // Handle Mouse Move over Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const mathX = xMin + (sx / rect.width) * (xMax - xMin);
    const mathY = yMax - (sy / rect.height) * (yMax - yMin);

    setHoverCoords({ x: Number(mathX.toFixed(3)), y: Number(mathY.toFixed(3)) });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Controls Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-cyan-400 font-mono">2D Grapher</span>
          {hoverCoords && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              X: {hoverCoords.x}, Y: {hoverCoords.y}
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(0.7)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => handleZoom(1.4)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* GRAPH CANVAS DISPLAY */}
      <div className="w-full aspect-[4/3] max-h-[340px] bg-slate-950 relative border-b border-slate-800">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoords(null)}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* FUNCTION MANAGER */}
      <div className="p-3 flex-1 flex flex-col gap-3">
        <form onSubmit={handleAddFunction} className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-cyan-400">f(x) =</span>
            <input
              type="text"
              value={newExpr}
              onChange={(e) => setNewExpr(e.target.value)}
              placeholder="e.g. 3*x + 2, cos(x), x^3"
              className="w-full pl-14 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Plot</span>
          </button>
        </form>

        {/* Function List */}
        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
          {functions.map((fn) => (
            <div
              key={fn.id}
              className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow"
                  style={{ backgroundColor: fn.color }}
                />
                <span className="font-mono text-sm text-slate-200">
                  f(x) = {fn.expression}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(fn.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {fn.isVisible ? (
                    <Eye className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <button
                  onClick={() => removeFunction(fn.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

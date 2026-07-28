import React, { useState } from 'react';
import { Binary, Sparkles, CheckCircle2 } from 'lucide-react';
import { evaluate } from 'mathjs';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

export const EquationSolver: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quadratic' | 'system' | 'derivative'>('quadratic');

  // Quadratic inputs
  const [qa, setQa] = useState<string>('1');
  const [qb, setQb] = useState<string>('-5');
  const [qc, setQc] = useState<string>('6');
  const [qResult, setQResult] = useState<any>(null);

  // System 2x2 inputs
  const [a1, setA1] = useState<string>('2');
  const [b1, setB1] = useState<string>('3');
  const [c1, setC1] = useState<string>('12');
  const [a2, setA2] = useState<string>('1');
  const [b2, setB2] = useState<string>('-1');
  const [c2, setC2] = useState<string>('1');
  const [sysResult, setSysResult] = useState<any>(null);

  // Derivative inputs
  const [derivExpr, setDerivExpr] = useState<string>('x^3 - 3*x^2 + 2');
  const [xVal, setXVal] = useState<string>('2');
  const [derivResult, setDerivResult] = useState<any>(null);

  // Solve Quadratic
  const handleSolveQuadratic = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playEqualsSuccess();

    const a = parseFloat(qa);
    const b = parseFloat(qb);
    const c = parseFloat(qc);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    if (a === 0) {
      setQResult({ error: 'a cannot be 0 for a quadratic equation.' });
      return;
    }

    const disc = b * b - 4 * a * c;
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);

    if (disc >= 0) {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      setQResult({
        discriminant: disc,
        roots: [x1.toFixed(4), x2.toFixed(4)],
        vertex: { h: h.toFixed(4), k: k.toFixed(4) },
        latexSteps: [
          `\\text{Equation: } ${a}x^2 + (${b})x + (${c}) = 0`,
          `\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${disc}`,
          `x_{1,2} = \\frac{-(${b}) \\pm \\sqrt{${disc}}}{2(${a})}`,
          `x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}`,
          `\\text{Vertex } (h,k) = (${h.toFixed(4)}, ${k.toFixed(4)})`,
        ],
      });
    } else {
      const real = h.toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
      setQResult({
        discriminant: disc,
        roots: [`${real} + ${imag}i`, `${real} - ${imag}i`],
        vertex: { h: h.toFixed(4), k: k.toFixed(4) },
        latexSteps: [
          `\\text{Equation: } ${a}x^2 + (${b})x + (${c}) = 0`,
          `\\Delta = (${b})^2 - 4(${a})(${c}) = ${disc} < 0 \\quad (\\text{Complex Roots})`,
          `x_1 = ${real} + ${imag}i, \\quad x_2 = ${real} - ${imag}i`,
        ],
      });
    }
  };

  // Solve 2x2 System
  const handleSolveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playEqualsSuccess();

    const A1 = parseFloat(a1), B1 = parseFloat(b1), C1 = parseFloat(c1);
    const A2 = parseFloat(a2), B2 = parseFloat(b2), C2 = parseFloat(c2);

    if ([A1, B1, C1, A2, B2, C2].some(isNaN)) return;

    const D = A1 * B2 - A2 * B1;
    const Dx = C1 * B2 - C2 * B1;
    const Dy = A1 * C2 - A2 * C1;

    if (D === 0) {
      if (Dx === 0 && Dy === 0) {
        setSysResult({ error: 'Infinitely many solutions (dependent system).' });
      } else {
        setSysResult({ error: 'No solution (parallel lines).' });
      }
      return;
    }

    const x = Dx / D;
    const y = Dy / D;

    setSysResult({
      x: x.toFixed(4),
      y: y.toFixed(4),
      latexSteps: [
        `\\text{Determinant } D = (${A1})(${B2}) - (${A2})(${B1}) = ${D}`,
        `D_x = (${C1})(${B2}) - (${C2})(${B1}) = ${Dx}`,
        `D_y = (${A1})(${C2}) - (${A2})(${C1}) = ${Dy}`,
        `x = \\frac{D_x}{D} = \\frac{${Dx}}{${D}} = ${x.toFixed(4)}`,
        `y = \\frac{D_y}{D} = \\frac{${Dy}}{${D}} = ${y.toFixed(4)}`,
      ],
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-3 overflow-y-auto">
      {/* Sub-tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl mb-3 border border-slate-800">
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('quadratic');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'quadratic' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Quadratic
        </button>
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('system');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'system' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2x2 System
        </button>
        <button
          onClick={() => {
            sounds.playKeyClick();
            setActiveTab('derivative');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'derivative' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Calculus Point
        </button>
      </div>

      {/* QUADRATIC TAB */}
      {activeTab === 'quadratic' && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSolveQuadratic} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Solve: ax² + bx + c = 0
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-mono">a</label>
                <input
                  type="number"
                  value={qa}
                  onChange={(e) => setQa(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono">b</label>
                <input
                  type="number"
                  value={qb}
                  onChange={(e) => setQb(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono">c</label>
                <input
                  type="number"
                  value={qc}
                  onChange={(e) => setQc(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white text-center"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Solve Equation
            </button>
          </form>

          {qResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              {qResult.error ? (
                <span className="text-rose-400 text-xs font-medium">{qResult.error}</span>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Roots Solved</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono text-sm">
                    {qResult.latexSteps.map((step: string, idx: number) => (
                      <div key={idx} className="text-slate-200">
                        <KaTeXView latex={step} displayMode={false} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2X2 SYSTEM TAB */}
      {activeTab === 'system' && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSolveSystem} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Solve 2x2 System (Cramer's Rule)
            </span>
            {/* Eq 1 */}
            <div className="grid grid-cols-3 gap-2 items-center">
              <input
                type="number"
                value={a1}
                onChange={(e) => setA1(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="a1"
              />
              <input
                type="number"
                value={b1}
                onChange={(e) => setB1(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="b1"
              />
              <input
                type="number"
                value={c1}
                onChange={(e) => setC1(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="c1"
              />
            </div>
            {/* Eq 2 */}
            <div className="grid grid-cols-3 gap-2 items-center">
              <input
                type="number"
                value={a2}
                onChange={(e) => setA2(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="a2"
              />
              <input
                type="number"
                value={b2}
                onChange={(e) => setB2(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="b2"
              />
              <input
                type="number"
                value={c2}
                onChange={(e) => setC2(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-mono"
                placeholder="c2"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Solve System
            </button>
          </form>

          {sysResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              {sysResult.error ? (
                <span className="text-rose-400 text-xs font-medium">{sysResult.error}</span>
              ) : (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono text-sm">
                  {sysResult.latexSteps.map((step: string, idx: number) => (
                    <div key={idx} className="text-slate-200">
                      <KaTeXView latex={step} displayMode={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CALCULUS TAB */}
      {activeTab === 'derivative' && (
        <div className="flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sounds.playEqualsSuccess();
              const x = parseFloat(xVal);
              if (isNaN(x)) return;
              try {
                const fn = (value: number) => {
                  const result = evaluate(derivExpr, { x: value });
                  if (typeof result !== 'number' || !Number.isFinite(result)) {
                    throw new Error('Expression must evaluate to a finite real number.');
                  }
                  return result;
                };
                const fx = fn(x);
                const h = 0.0001;
                const fPrime = (fn(x + h) - fn(x - h)) / (2 * h);
                setDerivResult({
                  fx: fx.toFixed(4),
                  fPrime: fPrime.toFixed(4),
                  latexSteps: [
                    `\\text{Function: } f(x) = ${derivExpr}`,
                    `\\text{Evaluated at } x_0 = ${x}`,
                    `f(${x}) = ${fx.toFixed(4)}`,
                    `\\text{Derivative } f'(${x}) \\approx \\frac{f(${x}+h) - f(${x}-h)}{2h} = ${fPrime.toFixed(4)}`,
                    `\\text{Tangent Line: } y - ${fx.toFixed(4)} = ${fPrime.toFixed(4)}(x - ${x})`,
                  ],
                });
              } catch (err) {
                setDerivResult({ error: 'Invalid expression format. Use x as variable.' });
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3"
          >
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Calculus Point Evaluator & Derivative
            </span>
            <div>
              <label className="text-[11px] text-slate-400 font-mono mb-1 block">Function f(x):</label>
              <input
                type="text"
                value={derivExpr}
                onChange={(e) => setDerivExpr(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white"
                placeholder="e.g. x^3 - 3*x^2 + 2"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-mono mb-1 block">Evaluate at Point x₀:</label>
              <input
                type="number"
                value={xVal}
                onChange={(e) => setXVal(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white text-center"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Evaluate Derivative & Tangent Line
            </button>
          </form>

          {derivResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              {derivResult.error ? (
                <span className="text-rose-400 text-xs font-medium">{derivResult.error}</span>
              ) : (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-2 font-mono text-sm">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Step-by-Step Derivation:
                  </span>
                  {derivResult.latexSteps.map((step: string, idx: number) => (
                    <div key={idx} className="text-slate-200 text-xs">
                      <KaTeXView latex={step} displayMode={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

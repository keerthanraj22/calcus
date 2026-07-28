import { create, all } from 'mathjs';
import { AngleUnit } from '../types';

const math = create(all, {});

// Configure trig functions to respect AngleUnit
export function evaluateExpression(expr: string, angleUnit: AngleUnit = 'deg'): { result: string; numericValue?: number; error?: string } {
  if (!expr || expr.trim() === '') {
    return { result: '' };
  }

  try {
    // Sanitize common math symbols
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/e/g, 'e')
      .replace(/√\(/g, 'sqrt(')
      .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)')
      .replace(/(\d+)%/g, '($1/100)');

    // Scope for angle unit override if needed
    const scope: Record<string, any> = {};

    if (angleUnit === 'deg') {
      // Create degree-wrapper trig functions in scope or preprocessing
      sanitized = sanitized
        .replace(/sin\(([^)]+)\)/g, 'sin(($1) * deg)')
        .replace(/cos\(([^)]+)\)/g, 'cos(($1) * deg)')
        .replace(/tan\(([^)]+)\)/g, 'tan(($1) * deg)');
    }

    const compiled = math.compile(sanitized);
    const evalResult = compiled.evaluate(scope);

    if (evalResult === undefined || evalResult === null) {
      return { result: 'Error', error: 'Invalid expression' };
    }

    if (typeof evalResult === 'number') {
      if (isNaN(evalResult)) return { result: 'NaN', error: 'Not a Number' };
      if (!isFinite(evalResult)) return { result: 'Infinity', error: 'Division by zero or overflow' };

      // Format clean numbers
      const formatted = formatNumber(evalResult);
      return { result: formatted, numericValue: evalResult };
    }

    // Matrix or Complex or Fraction
    const str = math.format(evalResult, { precision: 12 });
    return { result: str };
  } catch (err: any) {
    return { result: 'Error', error: err.message || 'Syntax Error' };
  }
}

export function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-10 && num !== 0) return num.toExponential(6);
  if (Math.abs(num) >= 1e12) return num.toExponential(6);

  // Avoid trailing floating point artifacts like 0.30000000000000004
  const rounded = Number(Math.round(Number(num + 'e10')) + 'e-10');
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

export function convertUnits(val: number, from: string, to: string): number {
  try {
    const u = math.unit(val, from);
    return u.toNumber(to);
  } catch (e) {
    return NaN;
  }
}

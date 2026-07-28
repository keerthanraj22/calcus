export type CalculatorMode = 'basic' | 'scientific' | 'graphing' | 'equations' | 'ai' | 'formulas' | 'quiz' | 'history' | 'learn';

export type AngleUnit = 'deg' | 'rad';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  category: string;
  isFavorite?: boolean;
  notes?: string;
  latex?: string;
}

export interface FormulaVariable {
  symbol: string;
  label: string;
  defaultValue?: number;
  unit?: string;
}

export interface MathFormula {
  id: string;
  title: string;
  category: 'Algebra' | 'Geometry' | 'Trigonometry' | 'Calculus' | 'Statistics' | 'Finance' | 'Physics';
  latex: string;
  description: string;
  variables: FormulaVariable[];
  solveFn: (vars: Record<string, number>) => { result: number; stepLatex: string; unit?: string };
  diagramType?: 'circle' | 'triangle' | 'rectangle' | 'cylinder' | 'sphere' | 'cone' | 'trapezoid';
}

export interface AISolveStep {
  stepNumber: number;
  title: string;
  explanation: string;
  latex: string;
}

export interface AISolveResult {
  title: string;
  category: string;
  summary: string;
  finalAnswer: string;
  steps: AISolveStep[];
  formulasUsed?: string[];
  proTips?: string;
  similarPracticeProblem?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  latex?: string;
  hints: string[];
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizSet {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizAssessment {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correction?: string;
}

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  isVisible: boolean;
}

export type ThemeMode = 'cyber' | 'neoprene' | 'amoled' | 'paper' | 'sunset';

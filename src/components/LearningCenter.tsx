import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Calculator, 
  Layers, 
  ChevronRight, 
  Play, 
  RotateCcw,
  Loader2,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

interface SimpleTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  ruleSummary: string;
  ruleLatex: string;
  keySteps: string[];
  exampleProblem: {
    question: string;
    latex: string;
    steps: { stepNum: number; title: string; latex: string; explanation: string }[];
    finalAnswer: string;
  };
}

const LEARNING_TOPICS: SimpleTopic[] = [
  {
    id: 'pemdas',
    title: 'Order of Operations (PEMDAS)',
    icon: '⚡',
    description: 'Learn the exact order to calculate multi-operation expressions step by step.',
    ruleSummary: 'P = Parentheses, E = Exponents, MD = Multiply & Divide (left to right), AS = Add & Subtract (left to right).',
    ruleLatex: '\\text{PEMDAS: } () \\rightarrow x^n \\rightarrow \\times/\\div \\rightarrow +/-',
    keySteps: [
      '1. Calculate inside Parentheses (brackets) first.',
      '2. Evaluate Exponents or square roots.',
      '3. Do Multiplication and Division from left to right.',
      '4. Do Addition and Subtraction from left to right.'
    ],
    exampleProblem: {
      question: 'Evaluate: 8 + 2 × (5 - 2)^2',
      latex: '8 + 2 \\times (5 - 2)^2',
      steps: [
        {
          stepNum: 1,
          title: 'Parentheses First',
          latex: '5 - 2 = 3 \\implies 8 + 2 \\times (3)^2',
          explanation: 'Subtract inside parentheses: 5 - 2 = 3.'
        },
        {
          stepNum: 2,
          title: 'Exponents Next',
          latex: '3^2 = 9 \\implies 8 + 2 \\times 9',
          explanation: 'Square 3 to get 9.'
        },
        {
          stepNum: 3,
          title: 'Multiply Before Adding',
          latex: '2 \\times 9 = 18 \\implies 8 + 18',
          explanation: 'Multiply 2 by 9 to get 18.'
        },
        {
          stepNum: 4,
          title: 'Final Addition',
          latex: '8 + 18 = 26',
          explanation: 'Add 8 + 18 to obtain the final answer.'
        }
      ],
      finalAnswer: '26'
    }
  },
  {
    id: 'fractions',
    title: 'Adding & Subtracting Fractions',
    icon: '🍕',
    description: 'Master combining fractions with like and unlike denominators easily.',
    ruleSummary: 'Find a Common Denominator, convert top numerators, then add/subtract numerators.',
    ruleLatex: '\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}, \\quad \\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
    keySteps: [
      '1. Check if denominators are the same.',
      '2. If different, find the Least Common Denominator (LCD).',
      '3. Rewrite each fraction with the common denominator.',
      '4. Add or subtract the numerators and keep denominator same.',
      '5. Simplify fraction if possible.'
    ],
    exampleProblem: {
      question: 'Add fractions: 3/4 + 2/5',
      latex: '\\frac{3}{4} + \\frac{2}{5}',
      steps: [
        {
          stepNum: 1,
          title: 'Find Common Denominator',
          latex: '\\text{LCD of 4 and 5 is } 20',
          explanation: 'The common multiple of 4 and 5 is 20.'
        },
        {
          stepNum: 2,
          title: 'Convert Fractions',
          latex: '\\frac{3 \\times 5}{4 \\times 5} = \\frac{15}{20}, \\quad \\frac{2 \\times 4}{5 \\times 4} = \\frac{8}{20}',
          explanation: 'Multiply top and bottom so both denominators equal 20.'
        },
        {
          stepNum: 3,
          title: 'Combine Numerators',
          latex: '\\frac{15 + 8}{20} = \\frac{23}{20}',
          explanation: 'Add numerators 15 + 8 = 23.'
        },
        {
          stepNum: 4,
          title: 'Mixed Number Format',
          latex: '\\frac{23}{20} = 1 \\frac{3}{20}',
          explanation: '23 divided by 20 gives 1 with a remainder of 3.'
        }
      ],
      finalAnswer: '23/20 or 1 3/20'
    }
  },
  {
    id: 'percentages',
    title: 'Percentages & Discounts',
    icon: '🏷️',
    description: 'Understand percentage calculations, tips, taxes, and price discounts.',
    ruleSummary: 'Percent means "per 100". Divide by 100 or move decimal 2 places left.',
    ruleLatex: '\\text{Amount} = \\frac{\\text{Percent}}{100} \\times \\text{Total Value}',
    keySteps: [
      '1. Convert percentage to decimal by dividing by 100.',
      '2. Multiply decimal by total value.',
      '3. For discounts: Subtract result from original price.',
      '4. For tax/tip: Add result to original price.'
    ],
    exampleProblem: {
      question: 'Calculate a 15% tip on a $60 restaurant bill.',
      latex: '15\\% \\text{ of } \\$60',
      steps: [
        {
          stepNum: 1,
          title: 'Convert % to Decimal',
          latex: '15\\% = \\frac{15}{100} = 0.15',
          explanation: '15 divided by 100 is 0.15.'
        },
        {
          stepNum: 2,
          title: 'Multiply by Total',
          latex: '0.15 \\times 60 = 9.00',
          explanation: '0.15 times 60 equals $9.00 tip.'
        },
        {
          stepNum: 3,
          title: 'Total Bill with Tip',
          latex: '\\$60 + \\$9 = \\$69',
          explanation: 'Add original bill ($60) + tip ($9) = $69 total.'
        }
      ],
      finalAnswer: '$9 Tip ($69 Total)'
    }
  },
  {
    id: 'prealgebra',
    title: 'Solving Simple Equations (Find x)',
    icon: '🔍',
    description: 'Learn to isolate variables using inverse operations (addition/subtraction/multiplication/division).',
    ruleSummary: 'Whatever operation is done to one side of = MUST be done to the other side.',
    ruleLatex: 'ax + b = c \\implies ax = c - b \\implies x = \\frac{c - b}{a}',
    keySteps: [
      '1. Identify what is happening to x.',
      '2. Undo addition/subtraction first by doing the opposite.',
      '3. Undo multiplication/division to isolate x.',
      '4. Check your answer by plugging x back into the equation.'
    ],
    exampleProblem: {
      question: 'Solve for x: 3x + 7 = 22',
      latex: '3x + 7 = 22',
      steps: [
        {
          stepNum: 1,
          title: 'Undo Addition (+7)',
          latex: '3x + 7 - 7 = 22 - 7 \\implies 3x = 15',
          explanation: 'Subtract 7 from both sides to cancel out +7.'
        },
        {
          stepNum: 2,
          title: 'Undo Multiplication (×3)',
          latex: '\\frac{3x}{3} = \\frac{15}{3} \\implies x = 5',
          explanation: 'Divide both sides by 3 to isolate x.'
        },
        {
          stepNum: 3,
          title: 'Verify Answer',
          latex: '3(5) + 7 = 15 + 7 = 22 \\quad \\checkmark',
          explanation: 'Substitute x = 5 back in. 15 + 7 = 22, so x = 5 is correct!'
        }
      ],
      finalAnswer: 'x = 5'
    }
  },
  {
    id: 'geometry',
    title: 'Perimeter & Area Basics',
    icon: '📐',
    description: 'Calculate boundary lengths and surface areas for rectangles, triangles, and circles.',
    ruleSummary: 'Perimeter = distance around outside. Area = space inside shape.',
    ruleLatex: 'A_{\\text{rect}} = w \\times h, \\quad A_{\\text{tri}} = \\frac{1}{2} b h, \\quad A_{\\text{circle}} = \\pi r^2',
    keySteps: [
      '1. Identify shape and measurements (length, width, base, height, radius).',
      '2. Select appropriate formula.',
      '3. Substitute values carefully.',
      '4. Write answer with correct units (e.g. cm for perimeter, cm² for area).'
    ],
    exampleProblem: {
      question: 'Find the area of a triangle with base = 8 cm and height = 5 cm.',
      latex: 'A = \\frac{1}{2} \\times b \\times h',
      steps: [
        {
          stepNum: 1,
          title: 'Identify Base & Height',
          latex: 'b = 8\\text{ cm}, \\quad h = 5\\text{ cm}',
          explanation: 'Base is 8 cm and height is 5 cm.'
        },
        {
          stepNum: 2,
          title: 'Substitute in Formula',
          latex: 'A = \\frac{1}{2} \\times 8 \\times 5',
          explanation: 'Multiply base and height: 8 × 5 = 40.'
        },
        {
          stepNum: 3,
          title: 'Halve the Product',
          latex: 'A = \\frac{1}{2} \\times 40 = 20\\text{ cm}^2',
          explanation: 'Half of 40 is 20 square centimeters.'
        }
      ],
      finalAnswer: '20 cm²'
    }
  }
];

export const LearningCenter: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<SimpleTopic>(LEARNING_TOPICS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userQuery, setUserQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'tutor' | 'practice'>('concepts');

  // Practice Quiz State
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  const handleSelectTopic = (topic: SimpleTopic) => {
    sounds.playKeyClick();
    setSelectedTopic(topic);
    setCurrentStepIndex(0);
    setPracticeFeedback(null);
    setUserAnswerInput('');
  };

  const handleNextStep = () => {
    sounds.playKeyClick();
    if (currentStepIndex < selectedTopic.exampleProblem.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleResetSteps = () => {
    sounds.playKeyClick();
    setCurrentStepIndex(0);
  };

  // Ask AI Math Tutor
  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    sounds.playKeyClick();
    setAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: `Explain this basic math question simply for a student learning math step by step: ${userQuery}`,
          mode: 'beginner-learning',
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      sounds.playEqualsSuccess();
      setAiResponse(data.result);
    } catch (e) {
      sounds.playErrorTone();
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckPracticeAnswer = () => {
    sounds.playKeyClick();
    const cleanUser = userAnswerInput.trim().toLowerCase();
    const cleanExpected = selectedTopic.exampleProblem.finalAnswer.toLowerCase();

    if (cleanUser.includes(cleanExpected) || cleanExpected.includes(cleanUser)) {
      sounds.playEqualsSuccess();
      setPracticeFeedback('Correct! Outstanding work! You followed the steps perfectly.');
    } else {
      sounds.playErrorTone();
      setPracticeFeedback(`Not quite. The correct answer is ${selectedTopic.exampleProblem.finalAnswer}. Review the step-by-step breakdown above!`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-3 overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20">
            <Lightbulb className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white leading-tight">Math Learning Center</h2>
            <p className="text-[10px] text-slate-400">Step-by-step guides & beginner math tutor</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.playKeyClick();
              setActiveTab('concepts');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'concepts'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guides
          </button>
          <button
            onClick={() => {
              sounds.playKeyClick();
              setActiveTab('tutor');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tutor'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Tutor
          </button>
        </div>
      </div>

      {/* TOPIC SELECTOR HORIZONTAL SCROLL */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        {LEARNING_TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelectTopic(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
              selectedTopic.id === t.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.title}</span>
          </button>
        ))}
      </div>

      {/* VIEW CONTENT 1: CONCEPTS & INTERACTIVE STEP REVEALER */}
      {activeTab === 'concepts' && (
        <div className="flex flex-col gap-3">
          {/* RULE SUMMARY CARD */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3" /> Core Concept & Rule
              </span>
              <span className="text-xs font-bold text-white">{selectedTopic.title}</span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">{selectedTopic.description}</p>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-cyan-300 text-xs overflow-x-auto my-1">
              <KaTeXView latex={selectedTopic.ruleLatex} displayMode={true} />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[11px] font-bold text-slate-300">Key Steps to Remember:</span>
              <ul className="space-y-1">
                {selectedTopic.keySteps.map((ks, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{ks}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* INTERACTIVE STEP-BY-STEP REVEALER DEMO */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Interactive Step-by-Step Walkthrough</span>
              </div>
              <button
                onClick={handleResetSteps}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Restart Steps"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-bold text-slate-200">
              Problem: <span className="text-amber-300">{selectedTopic.exampleProblem.question}</span>
            </div>

            {/* Steps Container */}
            <div className="flex flex-col gap-2 my-1">
              {selectedTopic.exampleProblem.steps
                .slice(0, currentStepIndex + 1)
                .map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col gap-1 animate-fade-in shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">
                        Step {step.stepNum}: {step.title}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-cyan-200 my-0.5">
                      <KaTeXView latex={step.latex} displayMode={true} />
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">{step.explanation}</p>
                  </div>
                ))}
            </div>

            {/* Control Button */}
            {currentStepIndex < selectedTopic.exampleProblem.steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Reveal Step {currentStepIndex + 2}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>Final Solution Achieved: {selectedTopic.exampleProblem.finalAnswer}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>

          {/* QUICK PRACTICE BOX */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Quick Check
            </span>
            <p className="text-xs text-slate-300">
              Try solving: <span className="font-bold text-white">{selectedTopic.exampleProblem.question}</span>
            </p>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={userAnswerInput}
                onChange={(e) => setUserAnswerInput(e.target.value)}
                placeholder="Enter your final answer..."
                className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleCheckPracticeAnswer}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow active:scale-95 transition-all"
              >
                Check
              </button>
            </div>

            {practiceFeedback && (
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-amber-300 mt-1">
                {practiceFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW CONTENT 2: AI SIMPLE MATH TUTOR */}
      {activeTab === 'tutor' && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleAskTutor} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Ask AI Math Tutor Any Simple Math Question</span>
            </div>

            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g., 'How do I add 3/8 + 1/4 step by step?' or 'Explain why multiplying two negatives makes a positive'..."
              rows={3}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            <button
              type="submit"
              disabled={aiLoading || !userQuery.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking & Formulating Step-by-Step Response...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Get Simple Step-by-Step Explanation</span>
                </>
              )}
            </button>
          </form>

          {/* AI Tutor Response Display */}
          {aiResponse && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  AI Tutor Explanation
                </span>
                <h3 className="font-bold text-sm text-white">{aiResponse.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{aiResponse.summary}</p>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Complete Step-by-Step Guide:
                </span>
                {aiResponse.steps?.map((step: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center border border-cyan-500/30">
                        {step.stepNumber || idx + 1}
                      </span>
                      <span className="font-bold text-xs text-white">{step.title}</span>
                    </div>

                    {step.latex && (
                      <div className="p-2 rounded bg-slate-900 border border-slate-800/80 font-mono text-cyan-300 text-xs overflow-x-auto">
                        <KaTeXView latex={step.latex} displayMode={true} />
                      </div>
                    )}

                    <p className="text-xs text-slate-300">{step.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Final Answer */}
              {aiResponse.finalAnswer && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Final Result:
                  </span>
                  <div className="font-mono text-sm font-bold text-emerald-300">
                    {aiResponse.finalAnswer}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {aiResponse.proTips && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-300 flex items-start gap-1.5">
                  <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>{aiResponse.proTips}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

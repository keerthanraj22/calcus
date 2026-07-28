import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { QuizQuestion, QuizSet, QuizAssessment } from '../types';
import { KaTeXView } from './KaTeXView';
import { sounds } from '../utils/audio';

export const AIAssessmentQuiz: React.FC = () => {
  const [topic, setTopic] = useState<string>('Algebra');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<QuizAssessment | null>(null);
  const [score, setScore] = useState<number>(0);

  const topics = ['Algebra', 'Calculus', 'Trigonometry', 'Geometry', 'Linear Algebra', 'Word Problems'];
  const difficulties = ['Basic', 'Intermediate', 'Advanced', 'Olympiad'];

  // Generate Quiz Set
  const handleGenerateQuiz = async () => {
    sounds.playKeyClick();
    setLoading(true);
    setQuizSet(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowHint(false);
    setAssessment(null);
    setScore(0);

    try {
      const response = await fetch('/api/ai/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: 3 }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setQuizSet(data.data);
    } catch (e) {
      sounds.playErrorTone();
    } finally {
      setLoading(false);
    }
  };

  // Submit Question Answer
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !quizSet) return;
    sounds.playKeyClick();
    setLoading(true);

    const currentQ = quizSet.questions[currentIndex];
    const userAnswer = currentQ.options[selectedOption];
    const correctAnswer = currentQ.options[currentQ.correctOptionIndex];

    try {
      const response = await fetch('/api/ai/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQ.questionText,
          userAnswer,
          correctAnswer,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      if (data.assessment.isCorrect) {
        sounds.playEqualsSuccess();
        setScore((prev) => prev + 1);
      } else {
        sounds.playErrorTone();
      }

      setAssessment(data.assessment);
    } catch (e) {
      // Fallback local check
      const isCorrect = selectedOption === currentQ.correctOptionIndex;
      setAssessment({
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? 'Great job! Accurate answer.' : 'Not quite. Check the explanation step.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    sounds.playKeyClick();
    setSelectedOption(null);
    setShowHint(false);
    setAssessment(null);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-3 overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-white">AI Skill Assessment & Quiz</h2>
          <p className="text-[10px] text-slate-400">Test & master mathematical concepts</p>
        </div>
      </div>

      {/* TOPIC & DIFFICULTY CONFIGURATOR */}
      {!quizSet && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Select Math Topic:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    topic === t
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Difficulty Level:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    difficulty === d
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Generating Customized Quiz Set...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Start Practice Assessment</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ACTIVE QUIZ PLAYER */}
      {quizSet && currentIndex < quizSet.questions.length && (
        <div className="flex flex-col gap-3">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>
              Question {currentIndex + 1} of {quizSet.questions.length}
            </span>
            <span className="text-cyan-400">{quizSet.topic} ({quizSet.difficulty})</span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2">
            <h3 className="text-sm font-bold text-white leading-snug">
              {quizSet.questions[currentIndex].questionText}
            </h3>

            {quizSet.questions[currentIndex].latex && (
              <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-sm my-1">
                <KaTeXView latex={quizSet.questions[currentIndex].latex!} displayMode={true} />
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-2">
            {quizSet.questions[currentIndex].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                disabled={assessment !== null}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                  selectedOption === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{option}</span>
                {selectedOption === idx && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow" />}
              </button>
            ))}
          </div>

          {/* Action Row */}
          {!assessment ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-sm shadow shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <span>Submit Answer</span>
              )}
            </button>
          ) : (
            <div className="flex flex-col gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                {assessment.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className={`text-xs font-bold ${assessment.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {assessment.isCorrect ? 'Correct Answer!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-xs text-slate-300">{assessment.feedback}</p>
              <button
                onClick={handleNextQuestion}
                className="w-full py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs mt-1 flex items-center justify-center gap-1"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUIZ COMPLETED SUMMARY */}
      {quizSet && currentIndex >= quizSet.questions.length && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-white">Quiz Completed!</h3>
          <p className="text-xs text-slate-300">
            You scored <span className="font-bold text-emerald-400">{score}</span> out of{' '}
            <span className="font-bold text-white">{quizSet.questions.length}</span> in {quizSet.topic}!
          </p>
          <button
            onClick={() => setQuizSet(null)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Another Topic</span>
          </button>
        </div>
      )}
    </div>
  );
};

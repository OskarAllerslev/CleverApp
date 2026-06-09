import React, { useState, useEffect } from 'react';

interface Props {
  quizId: string;
  question: string;
  // Multiple Choice Props
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  points?: number;
  // Open-ended Props
  hint?: string;
  solution?: string;
}

export const QuizQuestion: React.FC<Props> = ({
  quizId,
  question,
  options,
  correctIndex,
  explanation,
  points = 50,
  hint,
  solution,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);

  // Open-ended state
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // Load solved state from localStorage
    const saved = localStorage.getItem(`clevermat-quiz-${quizId}`);
    if (saved === 'correct') {
      setSolved(true);
      if (options && correctIndex !== undefined) {
        setSelected(correctIndex);
        setChecked(true);
        setIsCorrect(true);
      } else {
        setShowSolution(true);
      }
    }
  }, [quizId, correctIndex, options]);

  const handleCheck = () => {
    if (selected === null || correctIndex === undefined) return;
    
    const correct = selected === correctIndex;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      localStorage.setItem(`clevermat-quiz-${quizId}`, 'correct');
      setSolved(true);
      
      // Dispatch custom event to notify layout/sidebar of progress update
      const event = new CustomEvent('clevermat-xp-earned', {
        detail: { quizId, points }
      });
      window.dispatchEvent(event);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setChecked(false);
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    if (!solved) {
      localStorage.setItem(`clevermat-quiz-${quizId}`, 'correct');
      setSolved(true);
      
      const event = new CustomEvent('clevermat-xp-earned', {
        detail: { quizId, points }
      });
      window.dispatchEvent(event);
    }
  };

  // Re-run KaTeX when states that reveal math update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('katex/dist/contrib/auto-render.mjs')
        .then((module) => {
          const renderMathInElement = module.default;
          renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        })
        .catch((err) => console.error('Failed to load KaTeX auto-render', err));
    }
  }, [checked, showHint, showSolution]);

  const isMultipleChoice = options !== undefined && correctIndex !== undefined;

  return (
    <div className="my-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg max-w-2xl mx-auto transition-all duration-300">
      {/* Quiz Header & XP Badge */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Øvelse & Practice
        </span>
        <span className={`text-xs font-outfit font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
          solved 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
            : 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
        }`}>
          {solved ? '✓ Gennemført' : `+${points} XP`}
        </span>
      </div>

      {/* Question */}
      <div className="text-slate-850 dark:text-slate-150 font-medium mb-5 leading-relaxed text-base math-rendered">
        {question}
      </div>

      {isMultipleChoice ? (
        <>
          {/* Options List */}
          <div className="space-y-3">
            {options.map((opt, idx) => {
              let optionStyles = 'border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/40 dark:hover:bg-slate-950/70 text-slate-700 dark:text-slate-300';
              
              if (selected === idx) {
                optionStyles = 'border-brand-500 bg-brand-50/20 text-brand-700 dark:border-brand-400 dark:bg-brand-950/20 dark:text-brand-300 ring-2 ring-brand-500/10';
              }
              
              if (checked) {
                if (idx === correctIndex) {
                  optionStyles = 'border-emerald-500 bg-emerald-50/20 text-emerald-700 dark:border-emerald-450 dark:bg-emerald-950/20 dark:text-emerald-350 font-semibold ring-2 ring-emerald-500/10';
                } else if (selected === idx) {
                  optionStyles = 'border-rose-500 bg-rose-50/20 text-rose-700 dark:border-rose-450 dark:bg-rose-950/20 dark:text-rose-350 line-through ring-2 ring-rose-500/10';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={checked}
                  onClick={() => setSelected(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 flex items-center justify-between ${
                    !checked ? 'cursor-pointer' : ''
                  } ${optionStyles}`}
                >
                  <span className="math-rendered">{opt}</span>
                  <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                    selected === idx
                      ? 'border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {checked && (
                <span className={`font-outfit font-bold text-sm flex items-center gap-1.5 ${
                  isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isCorrect ? 'Korrekt! Godt arbejdet.' : 'Hov, det var ikke helt rigtigt.'}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {checked && !isCorrect && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                >
                  Prøv igen
                </button>
              )}
              {!checked ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === null}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl text-white shadow-md transition-all duration-150 ${
                    selected === null
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 cursor-pointer hover:shadow-brand-500/10'
                  }`}
                >
                  Tjek svar
                </button>
              ) : null}
            </div>
          </div>

          {/* Explanation */}
          {checked && explanation && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="font-bold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                Forklaring
              </span>
              <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed math-rendered">
                {explanation}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Open Ended Action Controls */}
          <div className="flex gap-3 mt-4">
            {hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              >
                {showHint ? 'Skjul hint' : 'Vis hint'}
              </button>
            )}
            <button
              onClick={handleRevealSolution}
              className="px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 shadow-md cursor-pointer transition"
            >
              {showSolution ? 'Løsning vist' : 'Vis løsning'}
            </button>
          </div>

          {/* Hint Area */}
          {showHint && hint && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 animate-in fade-in duration-200">
              <span className="font-bold text-xs uppercase tracking-widest text-amber-650 dark:text-amber-405 block mb-1">
                Hint
              </span>
              <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed math-rendered">
                {hint}
              </p>
            </div>
          )}

          {/* Solution Area */}
          {showSolution && solution && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850/80 animate-in fade-in duration-200">
              <span className="font-bold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-2">
                Fuldstændig Løsning
              </span>
              <div className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed math-rendered">
                {solution}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizQuestion;

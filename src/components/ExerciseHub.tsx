import React, { useState, useEffect } from 'react';
import { calculateRewardXP, addXP } from '../lib/xpService';
import { logExerciseFailure } from '../lib/srsService';
import { authHelper } from '../lib/auth';
import katex from 'katex';

const renderMathToHtml = (text?: string): string => {
  if (!text) return '';
  
  // Replace block math $$...$$
  let html = text.replace(/\$\$(.+?)\$\$/gs, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      return `$$${math}$$`;
    }
  });

  // Replace inline math $...$
  html = html.replace(/\$(.+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return `$${math}$`;
    }
  });

  return html;
};

// Sound Synthesizers using Web Audio API for gamified feedback
const playSoundWrong = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.35);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error('Failed to play wrong answer sound', e);
  }
};

const playSoundCorrectLater = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [392.00, 523.25]; // G4 -> C5
    const duration = 0.12;
    
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * duration;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.02);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.error('Failed to play correct answer sound', e);
  }
};

const playSoundCorrectFirst = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
    const duration = 0.08;
    
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.01);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.error('Failed to play perfect run sound', e);
  }
};

export interface QuestionData {
  quizId: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  hint?: string;
  solution?: string;
  answer?: string;
  isPremium?: boolean;
}

interface Props {
  questions: QuestionData[];
}

export const ExerciseHub: React.FC<Props> = ({ questions }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  
  // Track state for the active question
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Status states loaded from localStorage for ALL questions in the array
  const [solvedStates, setSolvedStates] = useState<Record<string, boolean>>({});
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [perfectStates, setPerfectStates] = useState<Record<string, boolean>>({});

  // Open-ended state
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // User Premium check
  const [isUserPremium, setIsUserPremium] = useState(false);

  useEffect(() => {
    const checkPremium = () => {
      const user = authHelper.getUser();
      setIsUserPremium(user?.membershipType === 'PREMIUM');
    };
    checkPremium();
    window.addEventListener('clevermat_auth_change', checkPremium);
    return () => {
      window.removeEventListener('clevermat_auth_change', checkPremium);
    };
  }, []);

  // Load saved states from localStorage on mount and when questions change
  const loadSavedStates = () => {
    const solved: Record<string, boolean> = {};
    const attempts: Record<string, number> = {};
    const perfect: Record<string, boolean> = {};

    questions.forEach(q => {
      const isSolved = localStorage.getItem(`clevermat-quiz-${q.quizId}`) === 'correct';
      solved[q.quizId] = isSolved;
      
      const savedAttempts = localStorage.getItem(`clevermat-quiz-attempts-${q.quizId}`);
      attempts[q.quizId] = savedAttempts ? parseInt(savedAttempts, 10) : 0;
      
      const isPerfect = localStorage.getItem(`clevermat-quiz-status-${q.quizId}`) === 'perfect';
      perfect[q.quizId] = isPerfect;
    });

    setSolvedStates(solved);
    setAttemptCounts(attempts);
    setPerfectStates(perfect);
  };

  const questionIdsSerialized = questions.map(q => q.quizId).join(',');

  useEffect(() => {
    loadSavedStates();

    window.addEventListener('clevermat-srs-changed', loadSavedStates);
    return () => {
      window.removeEventListener('clevermat-srs-changed', loadSavedStates);
    };
  }, [questionIdsSerialized]);

  // When active index changes, load states for the active question
  const activeQuestion = questions[activeIdx];

  useEffect(() => {
    if (!activeQuestion) return;
    
    // Reset temporary interactive states
    setSelected(null);
    setChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    setShowSolution(false);

    // If already solved, pre-fill choices
    if (solvedStates[activeQuestion.quizId]) {
      setChecked(true);
      setIsCorrect(true);
      if (activeQuestion.options && activeQuestion.correctIndex !== undefined) {
        setSelected(activeQuestion.correctIndex);
      } else {
        setShowSolution(true);
      }
    }
  }, [activeIdx, activeQuestion?.quizId, solvedStates[activeQuestion?.quizId]]);

  // Math is now safely rendered using renderMathToHtml inline inside React render.

  if (questions.length === 0 || !activeQuestion) {
    return <div className="p-4 text-center text-slate-500">Ingen opgaver tilgængelige.</div>;
  }

  // Support both correctIndex and answer text
  const correctIndex = activeQuestion.correctIndex !== undefined
    ? activeQuestion.correctIndex
    : (activeQuestion.options && activeQuestion.answer
       ? activeQuestion.options.indexOf(activeQuestion.answer)
       : undefined);

  const isMultipleChoice = activeQuestion.options !== undefined && correctIndex !== undefined;
  const activeId = activeQuestion.quizId;
  const isLocked = activeQuestion.isPremium && !isUserPremium;

  const syncToBackend = async (attempts: number) => {
    const user = authHelper.getUser();
    if (!user) return; // Guest user fallback

    let folder = 'generelt';
    if (typeof window !== 'undefined') {
      const paths = window.location.pathname.split('/').filter(Boolean);
      if (paths.length >= 2) {
        folder = paths[paths.length - 2];
      }
    }

    try {
      const response = await fetch('/api/exercise/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          exerciseId: activeId,
          folder,
          attempts,
          question: activeQuestion.question,
          solution: activeQuestion.explanation || activeQuestion.solution || "Se teorien.",
          isHard: attempts > 2,
          isPremium: activeQuestion.isPremium
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local session to trigger global LevelProgressBar sync
        const savedSession = localStorage.getItem('clevermat_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          if (session.user) {
            session.user.xp = data.totalXp;
            session.user.level = data.level;
            localStorage.setItem('clevermat_session', JSON.stringify(session));
            window.dispatchEvent(new CustomEvent('clevermat_auth_change', { detail: session }));
          }
        }
      } else {
        console.error('Kunne ikke gemme fremskridt i skyen.');
      }
    } catch (err) {
      console.error('Netværksfejl ved synkronisering:', err);
    }
  };

  const handleCheck = () => {
    if (isLocked) return; // Blocked
    if (selected === null || correctIndex === undefined) return;
    
    const correct = selected === correctIndex;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      const currentAttempts = attemptCounts[activeId] || 0;
      const isPerfectRun = currentAttempts === 0;
      const points = calculateRewardXP(currentAttempts);

      // Play success sound
      if (isPerfectRun) {
        playSoundCorrectFirst();
      } else {
        playSoundCorrectLater();
      }

      // Save to localStorage
      localStorage.setItem(`clevermat-quiz-${activeId}`, 'correct');
      localStorage.setItem(`clevermat-quiz-status-${activeId}`, isPerfectRun ? 'perfect' : 'solved');

      // Update state
      setSolvedStates(prev => ({ ...prev, [activeId]: true }));
      if (isPerfectRun) {
        setPerfectStates(prev => ({ ...prev, [activeId]: true }));
      }

      // Add XP and notify layout/progress bar
      addXP(points);
      const event = new CustomEvent('clevermat-xp-earned', {
        detail: { quizId: activeId, points }
      });
      window.dispatchEvent(event);

      // Sync with cloud database
      syncToBackend(currentAttempts);
    } else {
      // Play wrong answer sound
      playSoundWrong();

      // Wrong answer - increment attempt count
      const newAttempts = (attemptCounts[activeId] || 0) + 1;
      localStorage.setItem(`clevermat-quiz-attempts-${activeId}`, newAttempts.toString());
      setAttemptCounts(prev => ({ ...prev, [activeId]: newAttempts }));
      
      // Log failure to Spaced Repetition queue (CleverSprint)
      const docTitle = typeof document !== 'undefined' ? document.title.split(' - ')[0] : 'Træningsopgave';
      logExerciseFailure(
        activeId,
        `${docTitle} - Opgave ${activeIdx + 1}`,
        activeQuestion.question,
        activeQuestion.explanation || activeQuestion.solution || "Se teori for løsning."
      );
    }
  };

  const handleReset = () => {
    if (isLocked) return;
    setSelected(null);
    setChecked(false);
  };

  const handleRevealSolution = () => {
    if (isLocked) return;
    setShowSolution(true);
    if (!solvedStates[activeId]) {
      const currentAttempts = attemptCounts[activeId] || 0;
      const points = calculateRewardXP(currentAttempts);

      localStorage.setItem(`clevermat-quiz-${activeId}`, 'correct');
      localStorage.setItem(`clevermat-quiz-status-${activeId}`, 'solved');

      setSolvedStates(prev => ({ ...prev, [activeId]: true }));

      addXP(points);
      const event = new CustomEvent('clevermat-xp-earned', {
        detail: { quizId: activeId, points }
      });
      window.dispatchEvent(event);

      // Sync with cloud database
      syncToBackend(currentAttempts);
    }
  };

  // Determine selector button classes for each question index
  const getSelectorBtnClass = (idx: number) => {
    const q = questions[idx];
    const base = "h-10 w-10 md:h-12 md:w-12 rounded-xl text-sm font-bold flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-sm focus:outline-none";
    
    const isActive = idx === activeIdx;
    
    if (q.isPremium) {
      // Markant Guld Outline and Text: border-amber-400 / text-amber-400
      if (isActive) {
        return `${base} border-amber-400 text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 ring-4 ring-amber-400/30`;
      }
      if (solvedStates[q.quizId]) {
        return `${base} border-amber-400 text-amber-400 bg-emerald-50/20 dark:bg-emerald-950/10`;
      }
      return `${base} border-amber-400 text-amber-400 bg-white dark:bg-slate-900 hover:bg-amber-50/30 dark:hover:bg-amber-950/10`;
    }

    // Non-premium questions (standard)
    if (isActive) {
      if (solvedStates[q.quizId]) {
        return `${base} bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-500/20`;
      }
      return `${base} bg-brand-600 text-white border-brand-700 ring-4 ring-brand-500/20`;
    }

    if (solvedStates[q.quizId]) {
      if (perfectStates[q.quizId]) {
        return `${base} bg-amber-50 dark:bg-amber-950/20 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-100/60`;
      }
      return `${base} bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60`;
    }

    return `${base} bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80`;
  };

  const currentAttempts = attemptCounts[activeId] || 0;
  const earnedXP = calculateRewardXP(currentAttempts);
  const isPerfect = perfectStates[activeId];

  return (
    <div className="my-8 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-2xl mx-auto transition-all duration-300">
      
      {/* Exercise Hub Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 block">
            Matematik Boss-Kamp ⚔️
          </span>
          <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-slate-150">
            Løs opgavesættet
          </h3>
        </div>
        
        {/* XP Status Badge for active question */}
        <div className="text-right">
          {isLocked ? (
            <span className="text-xs font-outfit font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/30 flex items-center gap-1.5 animate-pulse">
              <span>Premium Opgave 🔒</span>
            </span>
          ) : solvedStates[activeId] ? (
            <span className={`text-xs font-outfit font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
              isPerfect 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-250/20' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-250/20'
            }`}>
              {isPerfect ? '🏆 Perfekt! +50 XP' : `✓ Løst! +${earnedXP} XP`}
            </span>
          ) : (
            <span className="text-xs font-outfit font-extrabold px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-100/30 flex items-center gap-1.5">
              <span>Op til +50 XP</span>
            </span>
          )}
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {questions.map((q, idx) => {
          const isTaskPremiumLocked = q.isPremium && !isUserPremium;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`${getSelectorBtnClass(idx)} relative`}
              title={isTaskPremiumLocked ? `Premium: Opgave ${idx + 1}` : `Gå til opgave ${idx + 1}`}
            >
              {idx + 1}
              {isTaskPremiumLocked && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center shadow-md border border-white dark:border-slate-900 select-none">
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Question Box */}
      <div key={activeIdx} className="animate-in fade-in slide-in-from-right-3 duration-250">
        
        {isLocked ? (
          <div className="space-y-6">
            {/* Toned down and disabled question preview */}
            <div className="opacity-25 pointer-events-none select-none filter blur-[1.5px] transition-all duration-305">
              <div 
                className="text-slate-850 dark:text-slate-200 font-medium mb-6 leading-relaxed text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: renderMathToHtml(activeQuestion.question) }}
              />

              {isMultipleChoice ? (
                <div className="space-y-3.5">
                  {activeQuestion.options?.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled
                      className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-650 text-sm flex items-center justify-between"
                    >
                      <span dangerouslySetInnerHTML={{ __html: renderMathToHtml(opt) }} />
                      <span className="h-5.5 w-5.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-455">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 mt-6">
                  {activeQuestion.hint && (
                    <button
                      type="button"
                      disabled
                      className="px-4.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                    >
                      Vis hint
                    </button>
                  )}
                  <button
                    type="button"
                    disabled
                    className="px-5.5 py-3 text-sm font-bold rounded-xl text-slate-400 bg-slate-100 dark:bg-slate-800"
                  >
                    Vis løsning
                  </button>
                </div>
              )}
            </div>

            {/* Premium Lock Callout */}
            <div className="p-6 rounded-2xl border border-amber-250/20 bg-amber-50/20 dark:bg-amber-950/10 dark:border-amber-550/30 flex flex-col items-center text-center space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-xl text-amber-600 dark:text-amber-400 animate-bounce">
                🔒
              </div>
              <h4 className="font-outfit font-black text-slate-800 dark:text-white text-base">
                Denne opgave kræver Premium adgang
              </h4>
              <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed max-w-md">
                Lås op for at teste dig selv i de sværeste eksamensopgaver og optjene tredobbelt XP!
              </p>
              <a 
                href="/premium/terp" 
                className="px-6 py-3 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-450 text-xs font-extrabold text-white shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Opgrader til Premium ⚡
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Question text */}
            <div 
              className="text-slate-800 dark:text-slate-200 font-medium mb-6 leading-relaxed text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: renderMathToHtml(activeQuestion.question) }}
            />

            {isMultipleChoice ? (
              <>
                {/* Multiple Choice Options */}
                <div className="space-y-3.5">
                  {activeQuestion.options?.map((opt, idx) => {
                    let optionStyles = 'border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-100/80 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/40 dark:hover:bg-slate-950/70 text-slate-700 dark:text-slate-300';
                    
                    if (selected === idx) {
                      optionStyles = 'border-brand-500 bg-brand-50/20 text-brand-700 dark:border-brand-400 dark:bg-brand-950/20 dark:text-brand-300 ring-2 ring-brand-500/15';
                    }
                    
                    if (checked) {
                      if (idx === correctIndex && isCorrect) {
                        optionStyles = 'border-emerald-500 bg-emerald-50/25 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/15';
                      } else if (selected === idx && !isCorrect) {
                        optionStyles = 'border-rose-500 bg-rose-50/25 text-rose-700 dark:border-rose-500 dark:bg-rose-950/20 dark:text-rose-300 line-through ring-2 ring-rose-500/15';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={checked}
                        onClick={() => setSelected(idx)}
                        className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 flex items-center justify-between ${
                          !checked ? 'cursor-pointer' : ''
                        } ${optionStyles}`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: renderMathToHtml(opt) }} />
                        <span className={`h-5.5 w-5.5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                          selected === idx
                            ? 'border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400'
                            : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-550'
                        }`}>
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* MCQ Action Buttons */}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    {checked && (
                      <span className={`font-outfit font-bold text-sm flex items-center gap-1.5 ${
                        isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCorrect ? (
                          <>
                            <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isPerfect ? 'Rigtigt! Gennemført i 1. forsøg 🏆' : 'Korrekt! Du klarede det.'}
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>Ikke helt rigtigt. Svar reduceret med 15 XP.</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2.5">
                    {checked && !isCorrect && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-850 cursor-pointer transition-all duration-150"
                      >
                        Prøv igen
                      </button>
                    )}
                    {!checked ? (
                      <button
                        type="button"
                        onClick={handleCheck}
                        disabled={selected === null}
                        className={`px-5.5 py-3 text-sm font-bold rounded-xl text-white shadow-md transition-all duration-150 ${
                          selected === null
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-550 cursor-not-allowed shadow-none'
                            : 'bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 cursor-pointer hover:shadow-brand-500/15'
                        }`}
                      >
                        Tjek svar
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Explanation box */}
                {checked && isCorrect && activeQuestion.explanation && (
                  <div className="mt-6 p-4.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="font-bold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-550 block mb-2">
                      Forklaring
                    </span>
                    <p 
                      className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMathToHtml(activeQuestion.explanation) }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Open Ended controls */}
                <div className="flex gap-3 mt-6">
                  {activeQuestion.hint && (
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="px-4.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-850 cursor-pointer transition duration-150"
                    >
                      {showHint ? 'Skjul hint' : 'Vis hint'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRevealSolution}
                    className="px-5.5 py-3 text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 shadow-md cursor-pointer transition-all duration-150"
                  >
                    {showSolution ? 'Løsning vist' : 'Vis løsning'}
                  </button>
                </div>

                {/* Hint Box */}
                {showHint && activeQuestion.hint && (
                  <div className="mt-4 p-4.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 animate-in fade-in duration-200">
                    <span className="font-bold text-xs uppercase tracking-widest text-amber-650 dark:text-amber-400 block mb-1">
                      Hint
                    </span>
                    <p 
                      className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMathToHtml(activeQuestion.hint) }}
                    />
                  </div>
                )}

                {/* Solution Box */}
                {showSolution && activeQuestion.solution && (
                  <div className="mt-4 p-4.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850/80 animate-in fade-in duration-200">
                    <span className="font-bold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-2">
                      Fuldstændig Løsning
                    </span>
                    <div 
                      className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMathToHtml(activeQuestion.solution) }}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ExerciseHub;

import React, { useState, useEffect } from 'react';
import { getFlashcards, updateFlashcardSM2, type Flashcard } from '../lib/srsService';

export const CleverSprint: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(true);

  // Sync cards from local storage
  const loadCards = () => {
    const allCards = getFlashcards();
    setCards(allCards);

    const now = new Date();
    // Filter cards that are due for review (nextReview date is in the past or now)
    const due = allCards.filter(card => new Date(card.nextReview) <= now);
    
    // Sort so cards that are due first (older nextReview) or interval 0 (immediate) come first
    due.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

    setDueCards(due);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  useEffect(() => {
    loadCards();

    // Listen to changes (e.g. if a user fails a quiz on another tab/page)
    window.addEventListener('clevermat-srs-changed', loadCards);
    return () => {
      window.removeEventListener('clevermat-srs-changed', loadCards);
    };
  }, []);

  // Re-run KaTeX auto-renderer whenever the active card changes or the answer is revealed
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
  }, [currentIndex, showAnswer, dueCards]);

  const activeCard = dueCards[currentIndex];

  const handleRate = (rating: number) => {
    if (!activeCard) return;

    // Apply SuperMemo-2 algorithm changes
    updateFlashcardSM2(activeCard.id, rating);

    // Trigger exit animation transition
    setAnimatingIn(false);
    setTimeout(() => {
      // Reload queue and advance index
      loadCards();
      setAnimatingIn(true);
    }, 200);
  };

  // Calculate dynamic intervals for okay/easy buttons
  const getNextIntervals = (card: Flashcard) => {
    let okayDays = 1;
    let easyDays = 4;

    // Okay calculation
    if (card.interval === 0) {
      okayDays = 1;
    } else if (card.interval === 1) {
      okayDays = 3;
    } else {
      okayDays = Math.round(card.interval * card.easeFactor);
    }

    // Easy calculation
    if (card.interval === 0) {
      easyDays = 1;
    } else if (card.interval === 1) {
      easyDays = 4;
    } else {
      easyDays = Math.round(card.interval * card.easeFactor * 1.25);
    }

    return { okayDays, easyDays };
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 block mb-1">
          Intelligent Repetition 🧠
        </span>
        <h1 className="font-outfit font-black text-3xl text-slate-800 dark:text-white tracking-tight">
          CleverSprint
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
          Baseret på Anki & SuperMemo-2 algoritmen. Vi sporer automatisk dine fejl og lader dig terpe dem, indtil det sidder i rygmarven.
        </p>
      </div>

      {dueCards.length > 0 && activeCard ? (
        <div className="space-y-6">
          
          {/* Card Queue Counter */}
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              Kort i kø: <span className="text-brand-600 dark:text-brand-400 font-extrabold">{dueCards.length}</span>
            </span>
            <span>
              Kort {currentIndex + 1} af {dueCards.length}
            </span>
          </div>

          {/* Flashcard container */}
          <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 transform min-h-[300px] flex flex-col justify-between ${
            animatingIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}>
            
            {/* Card Content Top */}
            <div>
              {/* Category / Topic Title */}
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-250/20 px-2.5 py-1 rounded-full inline-block mb-4">
                {activeCard.title}
              </span>

              {/* Question Text */}
              <div className="text-slate-800 dark:text-slate-200 font-medium text-base md:text-lg leading-relaxed mb-6 math-rendered">
                {activeCard.question}
              </div>

              {/* Solution display */}
              {showAnswer && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                    Fuldstændig Løsning / Bevis
                  </span>
                  <div className="text-slate-700 dark:text-slate-350 text-sm leading-relaxed math-rendered">
                    {activeCard.solution}
                  </div>
                </div>
              )}
            </div>

            {/* Controls Bottom */}
            <div className="mt-8 pt-4">
              {!showAnswer ? (
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-3.5 px-6 font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 rounded-xl shadow-md cursor-pointer transform active:scale-[0.98] transition-all"
                >
                  Vis Svar og Løsning
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-[9px] font-black text-center uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Hvor svært var dette kort?
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Hard Button */}
                    <button
                      type="button"
                      onClick={() => handleRate(1)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-250/30 bg-rose-50/25 hover:bg-rose-50/50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/25 dark:hover:bg-rose-950/40 dark:text-rose-400 font-bold transition-all cursor-pointer shadow-sm group"
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">Hårdt</span>
                      <span className="text-[9px] font-mono text-rose-500 font-medium mt-1">10m</span>
                    </button>

                    {/* Okay Button */}
                    {(() => {
                      const { okayDays, easyDays } = getNextIntervals(activeCard);
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRate(2)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-250/30 bg-blue-50/25 hover:bg-blue-50/50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/25 dark:hover:bg-blue-950/40 dark:text-blue-400 font-bold transition-all cursor-pointer shadow-sm group"
                          >
                            <span className="text-xs group-hover:scale-110 transition-transform">Okay</span>
                            <span className="text-[9px] font-mono text-blue-500 font-medium mt-1">
                              {okayDays}d
                            </span>
                          </button>

                          {/* Easy Button */}
                          <button
                            type="button"
                            onClick={() => handleRate(3)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-250/30 bg-emerald-50/25 hover:bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40 dark:text-emerald-400 font-bold transition-all cursor-pointer shadow-sm group"
                          >
                            <span className="text-xs group-hover:scale-110 transition-transform">Nemt</span>
                            <span className="text-[9px] font-mono text-emerald-500 font-medium mt-1">
                              {easyDays}d
                            </span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Empty Queue Celebration Card */
        <div className="w-full bg-gradient-to-tr from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
          {/* Subtle golden background glow */}
          <div className="absolute -inset-10 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

          {/* Golden Badge Visual */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute h-20 w-20 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center font-outfit font-black text-2xl shadow-lg shadow-amber-500/25">
              🏆
            </div>
          </div>

          <h3 className="font-outfit font-black text-2xl text-slate-800 dark:text-white mb-2.5">
            Du er helt up-to-date!
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            Dit matematiske fundament er solidt. Der er ingen forfaldne kort i køen lige nu. 
          </p>

          <div className="text-xs bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200/20 dark:border-slate-800/20 rounded-xl p-3.5 inline-block text-slate-400 font-bold uppercase tracking-wider">
            Samlet antal kort i dit bibliotek: <span className="text-slate-700 dark:text-slate-200 font-extrabold">{cards.length}</span>
          </div>

          {cards.length > 0 && (
            <div className="mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-4">
                Snikkig smugkig i dit bibliotek
              </span>
              <button
                type="button"
                onClick={() => {
                  // Review all cards immediately (simulated exam prep, override dates)
                  const resetReviews = cards.map(c => ({
                    ...c,
                    nextReview: new Date().toISOString()
                  }));
                  setDueCards(resetReviews);
                }}
                className="px-6 py-2.5 text-xs font-black rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250/30 transition-all cursor-pointer"
              >
                Terp alle kort nu (Eksamenstræning) ⚔️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CleverSprint;

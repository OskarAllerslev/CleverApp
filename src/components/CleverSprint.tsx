import React, { useState, useEffect } from 'react';
import { getFlashcards, updateFlashcardSM2, type Flashcard } from '../lib/srsService';

interface CleverSprintProps {
  membershipType?: string;
}

const MOCK_PREVIEW_CARD: Flashcard = {
  id: 'mock-srs-preview',
  title: 'Tretrinsreglen & Differentialkvotient',
  question: 'Bevis at differentialkvotienten af $f(x) = x^2$ er $f\'(x) = 2x$ ved hjælp af sekantens hældning og grænseværdi (tretrinsreglen).',
  solution: 'Trin 1: Opsæt funktionstilvæksten $\\Delta y = f(x_0 + \\Delta x) - f(x_0)$. Trin 2: Divider med $\\Delta x$ for at få differenskvotienten. Trin 3: Lad $\\Delta x \\to 0$ for at finde differentialkvotienten $f\'(x_0) = 2x_0$.',
  interval: 0,
  easeFactor: 2.5,
  nextReview: new Date().toISOString()
};

export const CleverSprint: React.FC<CleverSprintProps> = ({ membershipType = 'GUEST' }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgradeSuccess, setIsUpgradeSuccess] = useState(false);

  // Sync cards from local storage or database depending on membership
  const loadCards = async () => {
    if (membershipType !== 'PREMIUM') {
      // Free/Guest users: do NOT call /api/premium/anki-queue (protect DB queries)
      const allCards = getFlashcards();
      setCards(allCards);

      const now = new Date();
      const due = allCards.filter(card => new Date(card.nextReview) <= now);
      
      due.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

      // If no cards are in queue, inject the mock preview card for beautiful background paywall visual
      if (due.length === 0) {
        due.push(MOCK_PREVIEW_CARD);
      }

      setDueCards(due);
      setCurrentIndex(0);
      setShowAnswer(false);
      return;
    }

    // Premium users: Load from database
    setIsLoading(true);
    try {
      const response = await fetch('/api/premium/anki-queue');
      if (response.ok) {
        const data = await response.json();
        const mappedCards: Flashcard[] = data.map((item: any) => ({
          id: item.cardId,
          title: item.cardId.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          question: item.question,
          solution: item.solution,
          interval: item.interval,
          easeFactor: item.easeFactor,
          nextReview: new Date(item.nextReview).toISOString()
        }));
        setCards(mappedCards);
        setDueCards(mappedCards); // Server filters by due date
        setCurrentIndex(0);
        setShowAnswer(false);
      } else {
        console.error('Failed to load Anki queue from database');
      }
    } catch (e) {
      console.error('Error fetching Anki queue:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();

    // Listen to changes (e.g. if a user fails a quiz on another tab/page)
    window.addEventListener('clevermat-srs-changed', loadCards);
    return () => {
      window.removeEventListener('clevermat-srs-changed', loadCards);
    };
  }, [membershipType]);

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

  const handleRate = async (rating: number) => {
    if (!activeCard) return;

    if (membershipType === 'PREMIUM') {
      try {
        const response = await fetch('/api/premium/anki-rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: activeCard.id, rating })
        });
        if (!response.ok) {
          console.error('Failed to submit card rating to database');
        }
      } catch (e) {
        console.error('Error submitting card rating:', e);
      }
    } else {
      // Local update
      updateFlashcardSM2(activeCard.id, rating);
    }

    // Trigger exit animation transition
    setAnimatingIn(false);
    setTimeout(() => {
      loadCards();
      setAnimatingIn(true);
    }, 200);
  };

  const handleUpgrade = async () => {
    if (membershipType === 'GUEST') {
      // Unregistered guest redirect to signup/login page with redirect back here
      window.location.href = '/login?redirect=/premium/terp';
      return;
    }

    try {
      const response = await fetch('/api/premium/upgrade', { method: 'POST' });
      if (response.ok) {
        // Upgrade locally in session too so it updates without delay
        const sessionStr = localStorage.getItem('clevermat_session');
        if (sessionStr) {
          try {
            const sessionObj = JSON.parse(sessionStr);
            if (sessionObj.user) {
              sessionObj.user.membershipType = 'PREMIUM';
              localStorage.setItem('clevermat_session', JSON.stringify(sessionObj));
            }
          } catch (e) {
            console.error('Failed to update local session:', e);
          }
        }
        setIsUpgradeSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert('Kunne ikke gennemføre premium opgradering. Prøv igen.');
      }
    } catch (e) {
      console.error('Upgrade request error:', e);
      alert('Der opstod en fejl. Prøv venligst igen.');
    }
  };

  // Calculate dynamic intervals for okay/easy buttons
  const getNextIntervals = (card: Flashcard) => {
    let okayDays = 1;
    let easyDays = 4;

    if (card.interval === 0) {
      okayDays = 1;
    } else if (card.interval === 1) {
      okayDays = 3;
    } else {
      okayDays = Math.round(card.interval * card.easeFactor);
    }

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
    <div className="w-full max-w-xl mx-auto py-8 px-4 relative min-h-[520px] flex flex-col justify-start">
      
      {/* Paywall Overlay for Free/Guest Users */}
      {membershipType !== 'PREMIUM' && (
        <div className="absolute inset-0 z-35 flex items-center justify-center px-4 py-8">
          {isUpgradeSuccess ? (
            /* Celebration Card */
            <div className="w-full max-w-md rounded-3xl border border-emerald-200/60 bg-white/95 dark:bg-slate-900/95 dark:border-emerald-500/30 p-8 shadow-2xl backdrop-blur-md text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-20 w-20 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-outfit font-black text-2xl shadow-lg shadow-emerald-500/25">
                  🎉
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-outfit text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
                  Tillykke! 🏆
                </h2>
                <p className="text-sm text-slate-650 dark:text-slate-350 font-bold">
                  Du er nu opgraderet til CleverSprint Premium.
                </p>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Gør dig klar til at optimere din eksamenslæsning...
                </p>
              </div>
            </div>
          ) : (
            /* Conversion Card */
            <div className="w-full max-w-md rounded-3xl border border-amber-200/60 bg-white/95 dark:bg-slate-900/95 dark:border-amber-500/30 p-8 shadow-2xl backdrop-blur-md text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Background glows */}
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/10 dark:bg-amber-500/25 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-brand-500/10 dark:bg-brand-500/25 blur-3xl pointer-events-none"></div>
              
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center font-outfit font-black text-xl shadow-lg shadow-amber-500/25">
                  ⚡
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-outfit text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
                  Lås op for CleverSprint <br />
                  <span className="bg-gradient-to-r from-amber-500 to-brand-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-brand-400">
                    Din Matematiske Hukommelse 🧠
                  </span>
                </h2>
                <div className="h-0.5 w-12 bg-amber-500 mx-auto rounded-full" />
              </div>

              <div className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed text-left space-y-3">
                <p>
                  Når du laver fejl i vores opgaver, opsamles de automatisk i din personlige database. CleverSprint bruger en <strong>videnskabelig Spaced Repetition algoritme</strong> til at beregne præcis, hvornår du skal se opgaverne igen.
                </p>
                <p>
                  Ved at repetere dine svage punkter lige før du er ved at glemme dem, lagres metoderne i din langtidshukommelse. Det sparer dig for <strong>20+ timers ineffektiv læsning</strong> og sikrer dig topkarakterer til eksamen! 📈
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer animate-pulse"
                >
                  Opgrader til Premium (Ubegrænset adgang) 🚀
                </button>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-2.5 block font-semibold">
                  {membershipType === 'GUEST' 
                    ? 'Opret en gratis bruger og prøv med det samme'
                    : 'Kom i gang på under 30 sekunder. Opsig når som helst.'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Container (blurred if not premium) */}
      <div className={membershipType !== 'PREMIUM' ? 'filter blur-md pointer-events-none select-none opacity-45 transition-all duration-300 flex-1 flex flex-col justify-start' : 'transition-all duration-300 flex-1 flex flex-col justify-start'}>
        
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

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <span className="h-8 w-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          </div>
        ) : dueCards.length > 0 && activeCard ? (
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
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block mb-2">
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
            <div className="absolute -inset-10 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

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
                  Smugkig i dit bibliotek
                </span>
                <button
                  type="button"
                  onClick={() => {
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
    </div>
  );
};

export default CleverSprint;

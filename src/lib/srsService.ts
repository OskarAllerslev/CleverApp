/**
 * Service for the Anki-inspired Spaced Repetition System (SRS) "CleverSprint".
 * Implements a SuperMemo-2 (SM2) style algorithm adapted for a 3-point scale.
 */

export interface Flashcard {
  id: string;
  title: string;
  question: string;
  solution: string;
  interval: number; // in days. 0 means review again today (10 minutes)
  easeFactor: number; // starts at 2.5, min 1.3
  nextReview: string; // ISO date string
}

/**
 * Gets the storage key based on authentication status (isolated user progress vs guest).
 */
const getStorageKey = (): string => {
  if (typeof window === 'undefined') return 'clevermat_srs_guest';
  
  const savedSession = localStorage.getItem('clevermat_session');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      if (session.user && session.user.email) {
        return `clevermat_srs_${session.user.email}`;
      }
    } catch (e) {
      console.error('Failed to parse session key in SRS', e);
    }
  }
  return 'clevermat_srs_guest';
};

/**
 * Loads all flashcards from local storage.
 */
export const getFlashcards = (): Flashcard[] => {
  if (typeof window === 'undefined') return [];
  const key = getStorageKey();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

/**
 * Saves the flashcard array to local storage and fires a sync event.
 */
export const saveFlashcards = (cards: Flashcard[]): void => {
  if (typeof window === 'undefined') return;
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(cards));
  
  // Notify other components (e.g. sidebar indicators or dashboards)
  window.dispatchEvent(new Event('clevermat-srs-changed'));
};

/**
 * Logs an exercise failure to the SRS system.
 * Adds the item to the queue or resets its review interval if it already exists.
 */
export const logExerciseFailure = (
  id: string,
  title: string,
  question: string,
  solution: string
): void => {
  const cards = getFlashcards();
  const existingIdx = cards.findIndex(c => c.id === id);
  
  const now = new Date();
  
  if (existingIdx > -1) {
    // If it exists, reset the interval to 0 (review immediately today)
    const card = cards[existingIdx];
    card.interval = 0;
    card.nextReview = now.toISOString();
    cards[existingIdx] = card;
  } else {
    // Add new card to queue
    const newCard: Flashcard = {
      id,
      title,
      question,
      solution,
      interval: 0,
      easeFactor: 2.5,
      nextReview: now.toISOString()
    };
    cards.push(newCard);
  }
  
  saveFlashcards(cards);
};

/**
 * Updates a flashcard based on the SuperMemo-2 algorithm.
 * @param id The flashcard ID
 * @param rating 1 = Hårdt (review in 10m), 2 = Okay (review tomorrow), 3 = Nemt (review in 4d)
 */
export const updateFlashcardSM2 = (id: string, rating: number): void => {
  const cards = getFlashcards();
  const idx = cards.findIndex(c => c.id === id);
  if (idx === -1) return;

  const card = cards[idx];
  let interval = card.interval;
  let easeFactor = card.easeFactor;

  if (rating === 1) { // Hårdt (fail/re-learn)
    interval = 0; // Review in 10 minutes
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 2) { // Okay
    if (interval === 0) {
      interval = 1; // 1 day
    } else if (interval === 1) {
      interval = 3; // 3 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    // Ease factor remains unchanged
  } else if (rating === 3) { // Nemt
    if (interval === 0) {
      interval = 1; // 1 day
    } else if (interval === 1) {
      interval = 4; // 4 days
    } else {
      interval = Math.round(interval * easeFactor * 1.25);
    }
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  // Calculate next review timestamp
  const nextReviewDate = new Date();
  if (interval === 0) {
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    // Clear hours to schedule for the beginning of that day
    nextReviewDate.setHours(0, 0, 0, 0);
  }

  card.interval = interval;
  card.easeFactor = easeFactor;
  card.nextReview = nextReviewDate.toISOString();

  cards[idx] = card;
  saveFlashcards(cards);
};

/**
 * Service for calculating XP, Level thresholds, and rewards.
 */

export const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

/**
 * Returns the cumulative XP required to reach a specific level (from Level 1).
 * E.g., Level 1 needs 0 XP. Level 2 needs getXPForLevel(1) XP. Level 3 needs getXPForLevel(1) + getXPForLevel(2) XP.
 */
export const getXPUpperLimit = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

export interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

/**
 * Calculates current level and progress within that level based on total cumulative XP.
 */
export const getLevelFromXP = (totalXP: number): LevelInfo => {
  let level = 1;
  while (true) {
    const nextLevelXPNeeded = getXPUpperLimit(level + 1);
    if (totalXP < nextLevelXPNeeded) {
      break;
    }
    level++;
  }

  const currentLevelStart = getXPUpperLimit(level);
  const nextLevelStart = getXPUpperLimit(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelStart;
  const xpNeededForNextLevel = nextLevelStart - currentLevelStart;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP: xpNeededForNextLevel,
    progressPercent
  };
};

/**
 * Penalty system:
 * - Base reward: 50 XP
 * - If incorrect on first attempt: lose 15 XP per incorrect attempt
 * - Minimum reward: 10 XP
 */
export const calculateRewardXP = (incorrectAttempts: number): number => {
  const penalty = incorrectAttempts * 15;
  return Math.max(10, 50 - penalty);
};

/**
 * Gets the total cumulative XP from session storage (if logged in) or guest local storage.
 */
export const getTotalXP = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const savedSession = localStorage.getItem('clevermat_session');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      if (session.user && typeof session.user.xp === 'number') {
        return session.user.xp;
      }
    } catch (e) {
      console.error('Failed to parse session XP', e);
    }
  }
  
  const localXP = localStorage.getItem('clevermat_local_xp');
  return localXP ? parseInt(localXP, 10) : 0;
};

/**
 * Adds XP to the user's profile or guest storage and returns the new total.
 */
export const addXP = (points: number): number => {
  if (typeof window === 'undefined') return 0;

  const savedSession = localStorage.getItem('clevermat_session');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      if (session.user) {
        session.user.xp = (session.user.xp || 0) + points;
        localStorage.setItem('clevermat_session', JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('clevermat_auth_change'));
        return session.user.xp;
      }
    } catch (e) {
      console.error('Failed to update session XP', e);
    }
  }

  // Guest local fallback
  const currentLocalXP = parseInt(localStorage.getItem('clevermat_local_xp') || '0', 10);
  const newLocalXP = currentLocalXP + points;
  localStorage.setItem('clevermat_local_xp', newLocalXP.toString());
  return newLocalXP;
};

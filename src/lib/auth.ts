/**
 * Supabase Authentication Helper & Context Scaffolding
 * 
 * This module scaffolds the Supabase authentication client and provides helper functions
 * for logging in, signing up, signing out, and tracking user session state.
 * To enable real database tracking, replace the mock implementation with your actual
 * Supabase URL and Anon Key.
 */

// If you want to use the official client, run: npm install @supabase/supabase-js
// and uncomment the lines below, then remove the mock implementation.
/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// Mock Supabase Client and session tracker for architecture scaffolding
export interface UserProfile {
  id: string;
  email: string;
  level: 'C' | 'B';
  xp: number;
  completed_topics: string[];
}

export interface AuthSession {
  user: UserProfile | null;
  expires_at?: number;
}

// Simulated client-side session state
let currentSession: AuthSession = {
  user: null
};

// Check if localStorage is available to persist mock state
const IS_BROWSER = typeof window !== 'undefined';

if (IS_BROWSER) {
  const savedSession = localStorage.getItem('clevermat_session');
  if (savedSession) {
    try {
      currentSession = JSON.parse(savedSession);
    } catch (e) {
      console.error('Failed to parse saved session', e);
    }
  }
}

function saveSession(session: AuthSession) {
  currentSession = session;
  if (IS_BROWSER) {
    localStorage.setItem('clevermat_session', JSON.stringify(session));
    // Dispatch a custom event to notify client-side components of the auth change
    window.dispatchEvent(new CustomEvent('clevermat_auth_change', { detail: session }));
  }
}

export const authHelper = {
  /**
   * Get current authenticated user profile
   */
  getUser(): UserProfile | null {
    return currentSession.user;
  },

  /**
   * Check if a user is currently logged in
   */
  isLoggedIn(): boolean {
    return currentSession.user !== null;
  },

  /**
   * Mock signup process
   */
  async signUp(email: string, password: string): Promise<{ data: { session: AuthSession | null }; error: Error | null }> {
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay

    if (!email.includes('@') || password.length < 6) {
      return {
        data: { session: null },
        error: new Error('Ugyldig e-mail eller adgangskode (skal være mindst 6 tegn).')
      };
    }

    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      level: 'C',
      xp: 100, // starting bonus XP
      completed_topics: []
    };

    const session: AuthSession = { user: mockUser };
    saveSession(session);

    return { data: { session }, error: null };
  },

  /**
   * Mock login process
   */
  async signIn(email: string, password: string): Promise<{ data: { session: AuthSession | null }; error: Error | null }> {
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay

    if (password === 'wrongpass') {
      return {
        data: { session: null },
        error: new Error('Forkert adgangskode. Prøv igen.')
      };
    }

    const mockUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      level: (IS_BROWSER && localStorage.getItem('math-level') as 'C' | 'B') || 'C',
      xp: 350,
      completed_topics: ['tal-og-algebra/regningsarter', 'tal-og-algebra/broeker']
    };

    const session: AuthSession = { user: mockUser };
    saveSession(session);

    return { data: { session }, error: null };
  },

  /**
   * Mock sign out process
   */
  async signOut(): Promise<{ error: Error | null }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    saveSession({ user: null });
    return { error: null };
  },

  /**
   * Track user progress: Complete a curriculum topic
   */
  completeTopic(topicId: string): UserProfile | null {
    if (!currentSession.user) return null;

    const user = currentSession.user;
    if (!user.completed_topics.includes(topicId)) {
      user.completed_topics.push(topicId);
      user.xp += 50; // Add 50 XP per topic completion
      saveSession({ user });
    }
    return user;
  }
};

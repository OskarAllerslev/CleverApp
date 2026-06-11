/**
 * Authentication helper for the client-side
 * Communicates with secure HTTPOnly session API endpoints
 */

export interface UserProfile {
  id: string;
  email: string;
  level: 'C' | 'B' | 'A';
  xp: number;
  completed_topics: string[];
  membershipType: 'FREE' | 'PREMIUM';
}

export interface AuthSession {
  user: UserProfile | null;
}

// Client-side session state
let currentSession: AuthSession = {
  user: null
};

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
    window.dispatchEvent(new CustomEvent('clevermat_auth_change', { detail: session }));
  }
}

export const authHelper = {
  getUser(): UserProfile | null {
    return currentSession.user;
  },

  isLoggedIn(): boolean {
    return currentSession.user !== null;
  },

  async signUp(email: string, password: string): Promise<{ data: { session: AuthSession | null }; error: Error | null }> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { data: { session: null }, error: new Error(data.error || 'Kunne ikke oprette profil.') };
      }
      saveSession(data.session);
      return { data: { session: data.session }, error: null };
    } catch (err: any) {
      return { data: { session: null }, error: err };
    }
  },

  async signIn(email: string, password: string): Promise<{ data: { session: AuthSession | null }; error: Error | null }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { data: { session: null }, error: new Error(data.error || 'Kunne ikke logge ind.') };
      }
      saveSession(data.session);
      return { data: { session: data.session }, error: null };
    } catch (err: any) {
      return { data: { session: null }, error: err };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {
      console.error('Failed to call server signout API', e);
    }
    
    // Always clear client-side state
    saveSession({ user: null });
    if (IS_BROWSER) {
      // Clear cookie just in case path is client-accessible
      document.cookie = 'clevermat_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    return { error: null };
  },

  completeTopic(topicId: string): UserProfile | null {
    if (!currentSession.user) return null;

    const user = currentSession.user;
    if (!user.completed_topics.includes(topicId)) {
      user.completed_topics.push(topicId);
      user.xp += 50;
      saveSession({ user });
    }
    return user;
  }
};
export default authHelper;

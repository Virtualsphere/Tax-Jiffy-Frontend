import type { AuthSession } from '../types/auth.types';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

/**
 * The company-GST the user is currently working on. Stored alongside the session
 * because it is session state: leaving it behind on logout would hand the next
 * user on this browser the previous user's selected entity.
 */
export const ACTIVE_ENTITY_KEY = 'active_company_gst_id';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser: (): Omit<AuthSession, 'token'> | null => {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  setUser: (user: Omit<AuthSession, 'token'>): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getActiveEntityId: (): number | null => {
    const raw = localStorage.getItem(ACTIVE_ENTITY_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  },

  setActiveEntityId: (id: number): void => {
    localStorage.setItem(ACTIVE_ENTITY_KEY, String(id));
  },

  /** Clears every trace of the session — token, profile, and selected entity. */
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVE_ENTITY_KEY);
  },
};

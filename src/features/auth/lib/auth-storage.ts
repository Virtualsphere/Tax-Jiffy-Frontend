import type { AuthSession } from '../types/auth.types';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

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

  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

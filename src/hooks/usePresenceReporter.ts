import { useEffect } from 'react';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { connectPresenceSocket } from '@/lib/presence-socket';

/**
 * Mounted once at the app shell. Keeps a live WebSocket connection open for as long as the user
 * is logged in — that connection is the entire presence signal the admin panel's Live Activity
 * page reads, no explicit ping needed. Polls for login/logout rather than hooking into the auth
 * flow directly, so it works regardless of which feature triggers a token change.
 */
export function usePresenceReporter(): void {
  useEffect(() => {
    let disconnect: (() => void) | null = null;

    const sync = () => {
      const token = authStorage.getToken();
      if (token && !disconnect) {
        disconnect = connectPresenceSocket(token);
      } else if (!token && disconnect) {
        disconnect();
        disconnect = null;
      }
    };

    sync();
    const interval = setInterval(sync, 5000);

    return () => {
      clearInterval(interval);
      disconnect?.();
    };
  }, []);
}

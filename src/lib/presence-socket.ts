import { Client } from '@stomp/stompjs';
import { env } from '@/config/env';

/** Resolves a relative path like "/ws" against the current origin, or passes an absolute ws(s):// URL through as-is. */
function resolveBrokerUrl(path: string): string {
  if (path.startsWith('ws://') || path.startsWith('wss://')) return path;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
}

let client: Client | null = null;

/**
 * Holding this connection open IS the presence signal the admin panel's Live Activity page
 * reads — no explicit "ping" message is sent. Connects once per login and stays open for the
 * life of the session; the backend flips the user back to offline when it disconnects.
 */
export function connectPresenceSocket(token: string): () => void {
  if (client?.active) {
    return () => {};
  }

  client = new Client({
    brokerURL: resolveBrokerUrl(env.VITE_WS_BASE_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  client.activate();

  return () => {
    client?.deactivate();
    client = null;
  };
}

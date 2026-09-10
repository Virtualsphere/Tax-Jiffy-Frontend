/**
 * Minimal JWT reading for session-expiry checks.
 *
 * The backend issues a signed JWT with an `exp` claim (24h by default). Only
 * the server can *verify* a token; the client reads `exp` purely so the UI can
 * log the user out when their session ends, instead of leaving them in an app
 * whose every request will fail with a 401.
 *
 * Every helper fails open: a token that is not a JWT, or a JWT with no `exp`,
 * is treated as "not expired". A parsing quirk must never lock a user out of an
 * otherwise valid session — the server remains the authority.
 */

type JwtPayload = {
  exp?: number;
  iat?: number;
  [claim: string]: unknown;
};

function base64UrlDecode(segment: string): string | null {
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    return atob(base64 + padding);
  } catch {
    return null;
  }
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const json = base64UrlDecode(parts[1]);
  if (!json) return null;

  try {
    const payload = JSON.parse(json);
    return typeof payload === 'object' && payload !== null ? payload : null;
  } catch {
    return null;
  }
}

/** The token's expiry as epoch milliseconds, or null when it carries no `exp`. */
export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    return null;
  }

  return payload.exp * 1000;
}

/**
 * Milliseconds until the token expires. Null when there is no expiry to
 * measure; negative once it has passed.
 */
export function msUntilExpiry(token: string | null): number | null {
  const expiryMs = getTokenExpiryMs(token);
  return expiryMs === null ? null : expiryMs - Date.now();
}

/**
 * Whether the session should be considered over.
 *
 * `skewMs` expires the token slightly early so a request fired at the boundary
 * does not land after the server-side expiry.
 */
export function isTokenExpired(token: string | null, skewMs = 5_000): boolean {
  const remaining = msUntilExpiry(token);
  if (remaining === null) return false;
  return remaining <= skewMs;
}

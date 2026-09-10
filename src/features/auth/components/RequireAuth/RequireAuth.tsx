import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { isTokenExpired, msUntilExpiry } from '@/features/auth/lib/jwt';

/** Where an ended session sends the user, so the login form can explain why. */
const EXPIRED_LOGIN_URL = `${ROUTES.auth.login}?session=expired`;

/**
 * Route guard for the authenticated areas of the app. Renders its nested routes
 * only for a present, unexpired token.
 *
 * A token that has passed its `exp` is as good as no token: previously the
 * guard only checked that one existed, so an idle tab kept showing the app
 * until some request happened to come back 401. This checks the expiry on every
 * navigation, and arms a timer so a tab left open logs itself out the moment the
 * session ends rather than waiting for the user to click something.
 */
export function RequireAuth() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = authStorage.getToken();
  const expired = isTokenExpired(token);

  useEffect(() => {
    if (!token) return;

    if (expired) {
      authStorage.clearToken();
      return;
    }

    const remaining = msUntilExpiry(token);
    if (remaining === null) return;

    const endSession = () => {
      authStorage.clearToken();
      navigate(EXPIRED_LOGIN_URL, { replace: true });
    };

    const timer = window.setTimeout(endSession, Math.max(0, remaining));

    // A sleeping machine does not run timers on schedule, so re-check whenever
    // the tab comes back to the foreground.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isTokenExpired(authStorage.getToken())) {
        endSession();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token, expired, navigate]);

  if (!token) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />;
  }

  if (expired) {
    return <Navigate to={EXPIRED_LOGIN_URL} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

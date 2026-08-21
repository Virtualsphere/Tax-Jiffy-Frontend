import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { authStorage } from '@/features/auth/lib/auth-storage';

/**
 * Route guard for the authenticated areas of the app. Renders its nested routes
 * only when a token is present; otherwise it redirects to login and remembers
 * the attempted location so the login flow can return the user there.
 */
export function RequireAuth() {
  const location = useLocation();

  if (!authStorage.getToken()) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

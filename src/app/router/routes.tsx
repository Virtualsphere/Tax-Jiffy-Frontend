import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LandingLayout } from '@/layouts/LandingLayout';
import { SignupLayout } from '@/layouts/SignupLayout';
import { ROUTES } from '@/config/routes';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: ROUTES.auth.signup,
    element: <SignupLayout />,
    children: [
      {
        index: true,
        element: <SignupPage />,
      },
    ],
  },
  {
    path: ROUTES.auth.root,
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.auth.login,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: ROUTES.notFound,
    element: <NotFoundPage />,
  },
]);

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingLayout } from '@/layouts/LandingLayout';
import { SignupLayout } from '@/layouts/SignupLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ROUTES } from '@/config/routes';
import { ErrorPage } from '@/pages/errors/ErrorPage';

const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import('@/features/auth/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
);

const GSTR1Page = lazy(() =>
  import('@/pages/dashboard/gstr1/GSTR1Page').then((m) => ({ default: m.GSTR1Page })),
);
const ModulePlaceholderPage = lazy(() =>
  import('@/pages/dashboard/ModulePlaceholderPage').then((m) => ({
    default: m.ModulePlaceholderPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <LandingLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: ROUTES.auth.signup,
    element: <SignupLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <SignupPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: ROUTES.auth.login,
    element: <SignupLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: ROUTES.dashboard.root,
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="gstr-1" replace />,
      },
      {
        path: 'gstr-1',
        element: (
          <SuspenseWrapper>
            <GSTR1Page />
          </SuspenseWrapper>
        ),
      },
      {
        path: ':moduleId',
        element: (
          <SuspenseWrapper>
            <ModulePlaceholderPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '/preview',
    element: <Navigate to={ROUTES.dashboard.root} replace />,
  },
  {
    path: ROUTES.notFound,
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

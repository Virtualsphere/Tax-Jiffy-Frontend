import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
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
const PreviewPage = lazy(() =>
  import('@/pages/preview/PreviewPage').then((m) => ({ default: m.PreviewPage })),
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
    path: ROUTES.preview,
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <PreviewPage />
          </SuspenseWrapper>
        ),
      },
    ],
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



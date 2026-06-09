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
const PricingPage = lazy(() =>
  import('@/pages/pricing/PricingPage').then((m) => ({ default: m.PricingPage })),
);
const BuyPlanPage = lazy(() =>
  import('@/pages/pricing/BuyPlanPage').then((m) => ({ default: m.BuyPlanPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/contact/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const ContactSalesPage = lazy(() =>
  import('@/pages/contact/ContactSalesPage').then((m) => ({ default: m.ContactSalesPage })),
);
const ContactSupportPage = lazy(() =>
  import('@/pages/contact/ContactSupportPage').then((m) => ({ default: m.ContactSupportPage })),
);
const ResourcesPage = lazy(() =>
  import('@/pages/resources/ResourcesPage').then((m) => ({ default: m.ResourcesPage })),
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
const EWayBillPage = lazy(() =>
  import('@/pages/dashboard/eWayBill/EWayBillPage').then((m) => ({ default: m.EWayBillPage })),
);
const EInvoicePage = lazy(() =>
  import('@/pages/dashboard/eInvoice/EInvoicePage').then((m) => ({ default: m.EInvoicePage })),
);
const GSTR2BPage = lazy(() =>
  import('@/pages/dashboard/gstr2b/GSTR2BPage').then((m) => ({ default: m.GSTR2BPage })),
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
      {
        path: 'pricing',
        element: (
          <SuspenseWrapper>
            <PricingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'buy-plan',
        element: (
          <SuspenseWrapper>
            <BuyPlanPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'contact',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <ContactPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'sales',
            element: (
              <SuspenseWrapper>
                <ContactSalesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'support',
            element: (
              <SuspenseWrapper>
                <ContactSupportPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'resources',
        element: (
          <SuspenseWrapper>
            <ResourcesPage />
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
        path: 'e-way-bill',
        element: (
          <SuspenseWrapper>
            <EWayBillPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'e-invoice',
        element: (
          <SuspenseWrapper>
            <EInvoicePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'gstr-2b',
        element: (
          <SuspenseWrapper>
            <GSTR2BPage />
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

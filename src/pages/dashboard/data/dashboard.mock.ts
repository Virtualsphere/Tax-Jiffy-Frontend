import { ROUTES } from '@/config/routes';
import type { DashboardQuickAction } from '@/pages/dashboard/types/dashboard.types';

/**
 * Hardcoded stat values used while the backend is unavailable.
 * The `colorClass` values reference CSS module classes from DashboardPage.module.css,
 * so they are applied at the component level rather than stored here.
 */
export const MOCK_STAT_VALUES = [
  { label: 'Invoices Filed', value: '1,247', emoji: '📄', colorKey: 'blue' },
  { label: 'Pending Returns', value: '3', emoji: '⏳', colorKey: 'orange' },
  { label: 'ITC Available', value: '₹4.2L', emoji: '💰', colorKey: 'green' },
  { label: 'Tax Liability', value: '₹1.8L', emoji: '📊', colorKey: 'purple' },
] as const;

export const MOCK_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    label: 'File GSTR-1',
    desc: 'Upload sales register & file your return',
    path: ROUTES.dashboard.gstr1,
    emoji: '📋',
  },
  {
    label: 'File GSTR-3B',
    desc: 'Prepare and submit your monthly summary',
    path: ROUTES.dashboard.gstr3b,
    emoji: '📝',
  },
  {
    label: 'Generate E-Invoice',
    desc: 'Create IRN for your B2B invoices',
    path: ROUTES.dashboard.eInvoice,
    emoji: '🧾',
  },
];

export const MOCK_USER_NAME = 'User';

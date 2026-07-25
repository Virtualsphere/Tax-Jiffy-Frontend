import type { ReactNode } from 'react';
import {
  IconBook,
  IconClipboard,
  IconClipboardCheck,
  IconDocument,
  IconGstr9,
  IconInwardSupply,
  IconOutwardSupply,
  IconRegister,
  IconTruck,
  IconWallet,
} from '@/components/Sidebar/SidebarIcons';
import { ROUTES } from '@/config/routes';

export type SidebarNavChild = {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
};

export type SidebarNavSection = {
  id: string;
  label: string;
  icon: ReactNode;
  children: SidebarNavChild[];
};

export type SidebarNavLink = {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
};

export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  {
    id: 'outward-supply',
    label: 'OUTWARD SUPPLY',
    icon: <IconOutwardSupply />,
    children: [
      { id: 'sale-register', label: 'Sale Register', icon: <IconRegister />, path: ROUTES.dashboard.saleRegister },
      { id: 'gstr-1', label: 'GSTR-1', icon: <IconClipboard />, path: ROUTES.dashboard.gstr1 },
      { id: 'gstr-1a', label: 'GSTR-1A', icon: <IconClipboard />, path: ROUTES.dashboard.gstr1a },
    ],
  },
  {
    id: 'inward-supply',
    label: 'INWARD SUPPLY',
    icon: <IconInwardSupply />,
    children: [
      { id: 'purchase-register', label: 'Purchase Register', icon: <IconRegister />, path: ROUTES.dashboard.purchaseRegister },
      { id: 'ims', label: 'IMS', icon: <IconDocument />, path: ROUTES.dashboard.ims },
      { id: 'gstr-2a', label: 'GSTR-2A', icon: <IconClipboard />, path: ROUTES.dashboard.gstr2a },
      { id: 'gstr-2b', label: 'GSTR-2B', icon: <IconClipboard />, path: ROUTES.dashboard.gstr2b },
      { id: 'itc-03', label: 'ITC-03', icon: <IconClipboard />, path: ROUTES.dashboard.itc03 },
      { id: 'itc-04', label: 'ITC-04', icon: <IconClipboard />, path: ROUTES.dashboard.itc04 },
    ],
  },
];

export function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconCreditCard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

export const SIDEBAR_NAV_LINKS: SidebarNavLink[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: <IconDashboard />, path: ROUTES.dashboard.companies },
  { id: 'user-management', label: 'USER MANAGEMENT', icon: <IconUsers />, path: ROUTES.dashboard.users },
  { id: 'roles', label: 'ROLE EDITOR', icon: <IconShield />, path: ROUTES.dashboard.roles },
  { id: 'subscription-plans', label: 'SUBSCRIPTION PLANS', icon: <IconCreditCard />, path: ROUTES.dashboard.subscriptionPlans },
  { id: 'e-invoice', label: 'E-INVOICE', icon: <IconDocument />, path: ROUTES.dashboard.eInvoice },
  { id: 'e-way-bill', label: 'E-WAY BILL', icon: <IconTruck />, path: ROUTES.dashboard.eWayBill },
  { id: 'gstr-3b', label: 'GSTR-3B', icon: <IconClipboardCheck />, path: ROUTES.dashboard.gstr3b },
  { id: 'gstr-9', label: 'GSTR-9', icon: <IconGstr9 />, path: ROUTES.dashboard.gstr9 },
  { id: 'gstr-9c', label: 'GSTR-9C', icon: <IconGstr9 />, path: ROUTES.dashboard.gstr9c },
  { id: 'gst-ledgers', label: 'GST LEDGERS', icon: <IconWallet />, path: ROUTES.dashboard.gstLedgers },
  { id: 'vendor-ledger', label: 'VENDOR LEDGER', icon: <IconBook />, path: ROUTES.dashboard.vendorLedger },
  { id: 'challan', label: 'CHALLAN', icon: <IconBook />, path: ROUTES.dashboard.challan },
];

export const DEFAULT_SIDEBAR_ENTITY = {
  companyName: 'VOLLERT INDIA PVT LTD.',
  gstin: '09AADCV5659C1Z5',
  location: 'Uttar Pradesh',
  period: "JUNE'2026",
} as const;

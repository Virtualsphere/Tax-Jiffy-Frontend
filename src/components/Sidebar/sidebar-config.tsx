import type { ReactNode } from 'react';
import {
  IconBook,
  IconClipboard,
  IconClipboardCheck,
  IconDocument,
  IconEInvoice,
  IconGSTReturns,
  IconGstr9,
  IconInwardSupply,
  IconOutwardSupply,
  IconSettings,
  IconSupplies,
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
  type: 'section';
  id: string;
  label: string;
  icon: ReactNode;
  children: SidebarNavChild[];
};

export type SidebarNavLink = {
  type: 'link';
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
};

export type SidebarNavItem = SidebarNavSection | SidebarNavLink;

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

export const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { type: 'link', id: 'dashboard', label: 'Dashboard', icon: <IconDashboard />, path: ROUTES.dashboard.companies },
  { type: 'link', id: 'e-invoice', label: 'E-Invoice', icon: <IconEInvoice />, path: ROUTES.dashboard.eInvoice },
  { type: 'link', id: 'e-way-bill', label: 'E-Way Bill', icon: <IconTruck />, path: ROUTES.dashboard.eWayBill },
  {
    type: 'section',
    id: 'supplies',
    label: 'Supplies',
    icon: <IconSupplies />,
    children: [
      { id: 'inward-supply', label: 'Inward Supply', icon: <IconInwardSupply />, path: ROUTES.dashboard.purchaseRegister },
      { id: 'outward-supply', label: 'Outward Supply', icon: <IconOutwardSupply />, path: ROUTES.dashboard.saleRegister },
      { id: 'ledgers', label: 'Ledgers', icon: <IconBook />, path: ROUTES.dashboard.vendorLedger },
    ]
  },
  {
    type: 'section',
    id: 'gst-forms',
    label: 'GST Returns',
    icon: <IconGSTReturns />,
    children: [
      { id: 'gstr-1', label: 'GSTR-1', icon: <IconClipboard />, path: ROUTES.dashboard.gstr1 },
      { id: 'ims', label: 'IMS', icon: <IconDocument />, path: ROUTES.dashboard.ims },
      { id: 'gstr-2a', label: 'GSTR-2A', icon: <IconClipboard />, path: ROUTES.dashboard.gstr2a },
      { id: 'gstr-2b', label: 'GSTR-2B', icon: <IconClipboard />, path: ROUTES.dashboard.gstr2b },
      { id: 'gstr-3b', label: 'GSTR-3B', icon: <IconClipboardCheck />, path: ROUTES.dashboard.gstr3b },
      { id: 'gstr-9', label: 'GSTR-9', icon: <IconGstr9 />, path: ROUTES.dashboard.gstr9 },
      { id: 'gstr-9c', label: 'GSTR-9C', icon: <IconGstr9 />, path: ROUTES.dashboard.gstr9c },
      { id: 'gstr-1a', label: 'GSTR-1A', icon: <IconClipboard />, path: ROUTES.dashboard.gstr1a },
      { id: 'gst-ledgers', label: 'GST Ledgers', icon: <IconWallet />, path: ROUTES.dashboard.gstLedgers },
      { id: 'challans', label: 'Challans', icon: <IconBook />, path: ROUTES.dashboard.challan },
    ]
  },
  {
    type: 'section',
    id: 'configuration',
    label: 'Settings',
    icon: <IconSettings />,
    children: [
      { id: 'user-management', label: 'User Management', icon: <IconUsers />, path: ROUTES.dashboard.users },
      { id: 'role-editor', label: 'Role Editor', icon: <IconShield />, path: ROUTES.dashboard.roles },
    ]
  }
];

export const DEFAULT_SIDEBAR_ENTITY = {
  companyName: 'VOLLERT INDIA PVT LTD.',
  gstin: '09AADCV5659C1Z5',
  location: 'Uttar Pradesh',
} as const;

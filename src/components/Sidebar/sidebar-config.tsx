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

export type SidebarNavChild = {
  id: string;
  label: string;
  icon: ReactNode;
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
};

export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  {
    id: 'outward-supply',
    label: 'OUTWARD SUPPLY',
    icon: <IconOutwardSupply />,
    children: [
      { id: 'sale-register', label: 'Sale Register', icon: <IconRegister /> },
      { id: 'gstr-1', label: 'GSTR-1', icon: <IconClipboard /> },
      { id: 'gstr-1a', label: 'GSTR-1A', icon: <IconClipboard /> },
    ],
  },
  {
    id: 'inward-supply',
    label: 'INWARD SUPPLY',
    icon: <IconInwardSupply />,
    children: [
      { id: 'purchase-register', label: 'Purchase Register', icon: <IconRegister /> },
      { id: 'ims', label: 'IMS', icon: <IconDocument /> },
      { id: 'gstr-2a', label: 'GSTR-2A', icon: <IconClipboard /> },
      { id: 'gstr-2b', label: 'GSTR-2B', icon: <IconClipboard /> },
      { id: 'itc-03', label: 'ITC-03', icon: <IconClipboard /> },
      { id: 'itc-04', label: 'ITC-04', icon: <IconClipboard /> },
    ],
  },
];

export const SIDEBAR_NAV_LINKS: SidebarNavLink[] = [
  { id: 'e-invoice', label: 'E-INVOICE', icon: <IconDocument /> },
  { id: 'e-way-bill', label: 'E-WAY BILL', icon: <IconTruck /> },
  { id: 'gstr-3b', label: 'GSTR-3B', icon: <IconClipboardCheck /> },
  { id: 'gstr-9', label: 'GSTR-9', icon: <IconGstr9 /> },
  { id: 'gstr-9c', label: 'GSTR-9C', icon: <IconGstr9 /> },
  { id: 'gst-ledgers', label: 'GST LEDGERS', icon: <IconWallet /> },
  { id: 'vendor-ledger', label: 'VENDOR LEDGER', icon: <IconBook /> },
  { id: 'challan', label: 'CHALLAN', icon: <IconBook /> },
];

export const DEFAULT_SIDEBAR_ENTITY = {
  companyName: 'VOLLERT INDIA PVT LTD.',
  gstin: '09AADCV5659C1Z5',
  location: 'Uttar Pradesh',
  period: "JUNE'2026",
} as const;

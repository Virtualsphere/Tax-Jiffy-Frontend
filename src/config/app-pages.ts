/**
 * Every page and screen a role can be granted permissions on.
 *
 * Role mappings are stored per screen (`pageNumber` = page name, `screenNumber`
 * = screen name) with add/edit/view/delete flags, so this list is what the Add
 * and Edit Role dialogs render rows for. It is the app's own navigation
 * flattened: one entry per page, plus a row per distinct sub-screen (tab or
 * step) where a page has them, so permissions can be granted at the granularity
 * a user actually experiences.
 *
 * Adding a page to the app means adding it here, otherwise no role can be given
 * access to it.
 */

export type AppScreen = {
  pageName: string;
  screenName: string;
};

export const APP_PAGES: readonly AppScreen[] = [
  // ── Dashboards ──
  { pageName: 'Dashboard', screenName: 'Companies Dashboard' },
  { pageName: 'Dashboard', screenName: 'GSTIN Dashboard' },

  // ── Documents ──
  { pageName: 'E-Invoice', screenName: 'Import & Sync' },
  { pageName: 'E-Invoice', screenName: 'Invoice List' },
  { pageName: 'E-Way Bill', screenName: 'Import & Sync' },
  { pageName: 'E-Way Bill', screenName: 'E-Way Bill List' },

  // ── Supplies ──
  { pageName: 'Inward Supply', screenName: 'Purchase Register Upload' },
  { pageName: 'Inward Supply', screenName: 'Review Sheets' },
  { pageName: 'Outward Supply', screenName: 'Sale Register Upload' },
  { pageName: 'Outward Supply', screenName: 'Sale Register List' },
  { pageName: 'Ledgers', screenName: 'Vendor Ledger' },

  // ── GST Returns ──
  { pageName: 'GSTR-1', screenName: 'Import' },
  { pageName: 'GSTR-1', screenName: 'E-Invoice Reconciliation' },
  { pageName: 'GSTR-1', screenName: 'E-Way Bill Reconciliation' },
  { pageName: 'GSTR-1', screenName: 'Return' },
  { pageName: 'GSTR-1', screenName: 'Submit & File' },
  { pageName: 'GSTR-1A', screenName: 'Amendments' },
  { pageName: 'IMS', screenName: 'Invoice List' },
  { pageName: 'GSTR-2A', screenName: 'Summary' },
  { pageName: 'GSTR-2B', screenName: 'Import' },
  { pageName: 'GSTR-2B', screenName: 'Reconciliation' },
  { pageName: 'GSTR-3B', screenName: 'Filing' },
  { pageName: 'GSTR-9', screenName: 'Annual Return' },
  { pageName: 'GSTR-9C', screenName: 'Reconciliation Statement' },
  { pageName: 'ITC-03', screenName: 'ITC Reversal' },
  { pageName: 'ITC-04', screenName: 'Job Work' },
  { pageName: 'GST Ledgers', screenName: 'Ledger Balances' },
  { pageName: 'Challans', screenName: 'Challan List' },

  // ── Settings ──
  { pageName: 'User Management', screenName: 'Users List' },
  { pageName: 'Role Editor', screenName: 'Roles List' },
  { pageName: 'Role Editor', screenName: 'Role Permissions' },
  { pageName: 'Billing', screenName: 'Billing Overview' },
  { pageName: 'Subscription Plans', screenName: 'Plans List' },
] as const;

/** Stable key for a screen — used to match saved mappings back to this list. */
export function screenKey(pageName: string, screenName: string): string {
  return `${pageName}||${screenName}`;
}

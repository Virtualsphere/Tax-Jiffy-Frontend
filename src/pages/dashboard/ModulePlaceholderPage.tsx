import { useParams } from 'react-router-dom';
import styles from '@/pages/dashboard/ModulePlaceholderPage.module.css';

/** Maps route param slug → display name */
const MODULE_NAMES: Record<string, string> = {
  'sale-register': 'Sale Register',
  'gstr-1a': 'GSTR-1A',
  'purchase-register': 'Purchase Register',
  ims: 'IMS',
  'gstr-2a': 'GSTR-2A',
  'gstr-2b': 'GSTR-2B',
  'itc-03': 'ITC-03',
  'itc-04': 'ITC-04',
  'e-invoice': 'E-Invoice',
  'e-way-bill': 'E-Way Bill',
  'gstr-3b': 'GSTR-3B',
  'gstr-9': 'GSTR-9',
  'gstr-9c': 'GSTR-9C',
  'gst-ledgers': 'GST Ledgers',
  'vendor-ledger': 'Vendor Ledger',
  challan: 'Challan',
};

export function ModulePlaceholderPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const displayName = MODULE_NAMES[moduleId ?? ''] ?? moduleId ?? 'Module';

  return (
    <div className={styles.page}>
      <div className={styles.icon}>🚧</div>
      <h2 className={styles.title}>{displayName}</h2>
      <p className={styles.subtitle}>
        This module is currently under development and will be available soon.
        Check back later for full functionality.
      </p>
      <span className={styles.badge}>Coming Soon</span>
    </div>
  );
}

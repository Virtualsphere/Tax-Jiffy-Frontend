import styles from '@/pages/preview/PreviewPage.module.css';

const MOCK_STATS = [
  { label: 'Invoices Filed', value: '1,247' },
  { label: 'Pending Returns', value: '3' },
  { label: 'ITC Available', value: '₹4.2L' },
  { label: 'Tax Liability', value: '₹1.8L' },
];

export function PreviewPage() {
  return (
    <div className={styles.page}>
      <span className={styles.badge}>🔍 Preview Mode</span>
      <h2 className={styles.heading}>Sidebar Preview</h2>
      <p className={styles.subtext}>
        This is a minimal shell layout to preview the sidebar component in context.
        Try collapsing and expanding the sidebar, toggling nav sections, and
        selecting different items.
      </p>

      <div className={styles.cards}>
        {MOCK_STATS.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <p className={styles.cardLabel}>{stat.label}</p>
            <p className={styles.cardValue}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

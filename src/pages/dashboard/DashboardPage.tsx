import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/dashboard/DashboardPage.module.css';

const STATS = [
  { label: 'Invoices Filed', value: '1,247', emoji: '📄', colorClass: styles.cardIconBlue },
  { label: 'Pending Returns', value: '3', emoji: '⏳', colorClass: styles.cardIconOrange },
  { label: 'ITC Available', value: '₹4.2L', emoji: '💰', colorClass: styles.cardIconGreen },
  { label: 'Tax Liability', value: '₹1.8L', emoji: '📊', colorClass: styles.cardIconPurple },
];

const QUICK_ACTIONS = [
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

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h2 className={styles.greeting}>Welcome back 👋</h2>
      <p className={styles.subtext}>
        Here&rsquo;s a quick overview of your GST compliance status for the current period.
      </p>

      <div className={styles.cards}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <div className={`${styles.cardIcon} ${stat.colorClass}`}>
              {stat.emoji}
            </div>
            <p className={styles.cardLabel}>{stat.label}</p>
            <p className={styles.cardValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.actionsTitle}>Quick Actions</h3>
      <div className={styles.actions}>
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.path} to={action.path} className={styles.actionCard}>
            <div className={styles.actionIcon}>{action.emoji}</div>
            <div className={styles.actionContent}>
              <p className={styles.actionLabel}>{action.label}</p>
              <p className={styles.actionDesc}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useDashboardData } from '@/pages/dashboard/hooks/useDashboardData';
import styles from '@/pages/dashboard/DashboardPage.module.css';

/** Maps colorKey from hook data → CSS module class */
const COLOR_CLASS_MAP: Record<string, string> = {
  blue: styles.cardIconBlue,
  orange: styles.cardIconOrange,
  green: styles.cardIconGreen,
  purple: styles.cardIconPurple,
};

export function DashboardPage() {
  const { stats, quickActions } = useDashboardData();

  return (
    <div className={styles.page}>
      <h2 className={styles.greeting}>Welcome back 👋</h2>
      <p className={styles.subtext}>
        Here&rsquo;s a quick overview of your GST compliance status for the current period.
      </p>

      <div className={styles.cards}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <div className={`${styles.cardIcon} ${COLOR_CLASS_MAP[stat.colorKey] ?? ''}`}>
              {stat.emoji}
            </div>
            <p className={styles.cardLabel}>{stat.label}</p>
            <p className={styles.cardValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.actionsTitle}>Quick Actions</h3>
      <div className={styles.actions}>
        {quickActions.map((action) => (
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

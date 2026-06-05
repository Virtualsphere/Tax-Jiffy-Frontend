import styles from '@/pages/pricing/components/PricingComparisonSection.module.css';

interface PricingComparisonSectionProps {
  isAnnual: boolean;
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconCheck}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconCross}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

export function PricingComparisonSection({ isAnnual }: PricingComparisonSectionProps) {
  const COMPARISON_DATA = [
    { feature: 'Users Included', free: '1', basic: '1', business: '3', enterprise: 'Unlimited' },
    { feature: 'Add-on Users', free: <CrossIcon />, basic: '₹30 per add-on user', business: '₹30 per add-on user', enterprise: 'Unlimited' },
    { feature: 'Transactions/Month', free: isAnnual ? '50 (600/yr)' : '50', basic: isAnnual ? '100 (1200/yr)' : '100', business: isAnnual ? '400 (4800/yr)' : '400', enterprise: 'Unlimited' },
    { feature: 'GSTR1 & GSTR3B', free: <CheckCircleIcon />, basic: <CheckCircleIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'IMS', free: <CheckCircleIcon />, basic: <CheckCircleIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'Admin Role', free: <CrossIcon />, basic: <CrossIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'GSTR9 Annual', free: <CrossIcon />, basic: <CrossIcon />, business: <CrossIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'E-Invoice', free: <CrossIcon />, basic: <CrossIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'E-Way Bill', free: <CrossIcon />, basic: <CrossIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'Notices', free: <CrossIcon />, basic: <CrossIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'Vendor ITC management', free: <CrossIcon />, basic: <CrossIcon />, business: <CheckCircleIcon />, enterprise: <CheckCircleIcon /> },
    { feature: 'Notification', free: 'Basic', basic: 'Basic', business: 'Real-time', enterprise: 'Real-time' },
    { feature: 'Data Storage', free: 'Our Server', basic: 'Our Server', business: 'Our Server', enterprise: 'Custom/Cloud' },
    { feature: 'Support', free: 'Email', basic: 'Chat', business: 'Priority', enterprise: 'Dedicated' },
    { feature: 'Data Migration', free: <CrossIcon />, basic: <CrossIcon />, business: 'Self-serve', enterprise: <CheckCircleIcon /> },
  ];

  return (
    <section className={styles.comparisonSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deep Comparison</h2>
        <p className={styles.subtitle}>Compare features across all tiers</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>FEATURES</th>
              <th>FREE</th>
              <th>BASIC</th>
              <th>BUSINESS</th>
              <th>ENTERPRISE</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx}>
                <td className={styles.featureCell}>{row.feature}</td>
                <td>{row.free}</td>
                <td>{row.basic}</td>
                <td>{row.business}</td>
                <td>{row.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

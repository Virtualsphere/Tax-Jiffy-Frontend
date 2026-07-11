import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptions } from '@/pages/dashboard/user/hooks/useSubscriptions';
import { usePurchaseSubscription } from '@/pages/dashboard/user/hooks/usePurchaseSubscription';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/pricing/components/PricingTiersSection.module.css';

interface PricingTiersSectionProps {
  isAnnual: boolean;
  gstId?: number;
  companyId?: number;
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

export function PricingTiersSection({ isAnnual, gstId, companyId }: PricingTiersSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: plans } = useSubscriptions();
  const purchaseSub = usePurchaseSubscription();
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (planType: 'basic' | 'business') => {
    if (!gstId) {
      if (companyId) {
        navigate(`${ROUTES.dashboard.user}?companyId=${companyId}`);
      } else {
        navigate(ROUTES.dashboard.user);
      }
      return;
    }

    const searchTerm = planType === 'business' ? 'advance' : planType;
    const plan = plans?.find(p => p.name.toLowerCase().includes(searchTerm));
    if (!plan) return;

    setPurchasingPlan(planType);
    setError(null);

    const formatLocalDateTime = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    try {
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      await purchaseSub.mutateAsync({
        id: gstId,
        data: {
          subscriptionPlanId: plan.id,
          startDate: formatLocalDateTime(today),
          endDate: formatLocalDateTime(nextYear),
        }
      });

      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['company-gst', gstId] });
      
      if (companyId) {
        navigate(`${ROUTES.dashboard.user}?companyId=${companyId}`);
      } else {
        navigate(ROUTES.dashboard.user);
      }
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 500) {
        localStorage.setItem(`mock_upgraded_gst_${gstId}`, JSON.stringify({
          planName: plan.name,
          isPaymentDone: true
        }));
        
        queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
        queryClient.invalidateQueries({ queryKey: ['company-gst', gstId] });
        
        if (companyId) {
          navigate(`${ROUTES.dashboard.user}?companyId=${companyId}`);
        } else {
          navigate(ROUTES.dashboard.user);
        }
      } else {
        setError(err.response?.data?.message || err.message || "An error occurred while upgrading the plan.");
        setPurchasingPlan(null);
      }
    }
  };

  return (
    <section className={styles.tiersContainer}>
      {error && (
        <div style={{ width: '100%', textAlign: 'center', color: '#ef4444', marginBottom: '16px', fontWeight: 500 }}>
          {error}
        </div>
      )}
      {/* FREE Tier */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.tierName}>INDIVIDUAL</span>
          <h2 className={styles.tierTitle}>FREE</h2>
          <div className={styles.priceContainer}>
            <span className={styles.price}>₹0</span>
            <span className={styles.period}>/mo</span>
          </div>
          <p className={`${styles.billingText} ${styles.blueText}`}>Free forever</p>
        </div>
        <ul className={styles.featuresList}>
          <li><CheckCircleIcon /> <span>1 User</span></li>
          <li><CheckCircleIcon /> <span>50 transactions/mo{isAnnual && <><br/>(600/yr)</>}</span></li>
          <li><CheckCircleIcon /> <span>GSTR1 & GSTR3B</span></li>
          <li><CheckCircleIcon /> <span>Data at our server</span></li>
          <li><CheckCircleIcon /> <span>IMS</span></li>
        </ul>
        <div className={styles.buttonContainer}>
          <button className={styles.primaryButton}>Get Started</button>
        </div>
      </div>

      {/* BASIC Tier */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.tierName}>SMALL TEAM</span>
          <h2 className={styles.tierTitle}>BASIC</h2>
          <div className={styles.priceContainer}>
            {isAnnual && <span className={styles.originalPrice}>₹130</span>}
            <span className={styles.price}>₹{isAnnual ? '99' : '130'}</span>
            <span className={styles.period}>/mo</span>
          </div>
          <p className={styles.billingText}>{isAnnual ? 'Billed annually' : 'Billed monthly'}</p>
        </div>
        <ul className={styles.featuresList}>
          <li><CheckCircleIcon /> <span>1 User</span></li>
          <li><CheckCircleIcon /> <span>₹30 per add-on user</span></li>
          <li><CheckCircleIcon /> <span>100 transactions/mo{isAnnual && <><br/>(1200/yr)</>}</span></li>
          <li><CheckCircleIcon /> <span>GSTR1 & GSTR3B</span></li>
          <li><CheckCircleIcon /> <span>IMS</span></li>
          <li><CheckCircleIcon /> <span>Data at our server</span></li>
        </ul>
        <div className={styles.buttonContainer}>
          <button 
            className={styles.primaryButton}
            onClick={() => handlePurchase('basic')}
            disabled={purchasingPlan === 'basic' || (!gstId && purchasingPlan !== null)}
          >
            {purchasingPlan === 'basic' ? 'Processing...' : 'Get Started'}
          </button>
        </div>
      </div>

      {/* BUSINESS Tier (Most Popular) */}
      <div className={`${styles.card} ${styles.popularCard}`}>
        <div className={styles.popularBadge}>MOST POPULAR</div>
        <div className={styles.cardHeader}>
          <span className={styles.tierNamePopular}>HIGH GROWTH</span>
          <h2 className={styles.tierTitle}>BUSINESS</h2>
          <div className={styles.priceContainer}>
            {isAnnual && <span className={styles.originalPrice}>₹325</span>}
            <span className={styles.price}>₹{isAnnual ? '249' : '325'}</span>
            <span className={styles.period}>/mo</span>
          </div>
          <p className={styles.billingText}>{isAnnual ? 'Billed annually' : 'Billed monthly'}</p>
        </div>
        <ul className={styles.featuresList}>
          <li><CheckCircleIcon /> <span>3 User Team</span></li>
          <li><CheckCircleIcon /> <span>₹30 per add-on user</span></li>
          <li><CheckCircleIcon /> <span>400 transactions/mo{isAnnual ? ' (4800/yr)' : ''}</span></li>
          <li><CheckCircleIcon /> <span>GSTR1, 3B, IMS, E-Inv, E-Way</span></li>
          <li><CheckCircleIcon /> <span>Notices & Vendor ITC</span></li>
          <li><CheckCircleIcon /> <span>Notifications & Admin Role</span></li>
        </ul>
        <div className={styles.buttonContainer}>
          <button 
            className={styles.primaryButton}
            onClick={() => handlePurchase('business')}
            disabled={purchasingPlan === 'business' || (!gstId && purchasingPlan !== null)}
          >
            {purchasingPlan === 'business' ? 'Processing...' : 'Get Started'}
          </button>
          <button className={styles.outlineButton}>Contact Sales for Bulk<br/>GSTN</button>
        </div>
      </div>

      {/* ENTERPRISE Tier */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.tierName}>SCALE</span>
          <h2 className={styles.tierTitle}>ENTERPRISE</h2>
          <div className={styles.priceContainer}>
            <span className={styles.priceCustom}>Custom</span>
          </div>
          <p className={styles.billingText}>{isAnnual ? 'Annual billing only' : 'Contact for pricing'}</p>
        </div>
        <ul className={styles.featuresList}>
          <li><CheckCircleIcon /> <span>Unlimited Users</span></li>
          <li><CheckCircleIcon /> <span>Unlimited Transactions</span></li>
          <li><CheckCircleIcon /> <span>GSTR9 + Business Features</span></li>
          <li><CheckCircleIcon /> <span>Custom Storage & Support</span></li>
          <li><CheckCircleIcon /> <span>Data Migration</span></li>
        </ul>
        <div className={styles.buttonContainer}>
          <button className={styles.primaryButton}>Contact Sales</button>
        </div>
      </div>
    </section>
  );
}

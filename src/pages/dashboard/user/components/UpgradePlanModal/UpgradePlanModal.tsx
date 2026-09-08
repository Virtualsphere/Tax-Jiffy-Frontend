import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { usePurchaseSubscription } from '../../hooks/usePurchaseSubscription';
import type { SubscriptionPlanResponse } from '../../types/subscription.types';
import styles from '../ConnectEntityModal/ConnectEntityModal.module.css';
import { useQueryClient } from '@tanstack/react-query';

interface UpgradePlanModalProps {
  gstId: number;
  onClose: () => void;
  isNewPurchase?: boolean;
}

export function UpgradePlanModal({ gstId, onClose, isNewPurchase = false }: UpgradePlanModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: plans, isLoading: isLoadingPlans } = useSubscriptions();
  const queryClient = useQueryClient();
  const purchaseSub = usePurchaseSubscription();

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanId) {
      setStep(2);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await purchaseSub.mutateAsync({
        id: gstId,
        data: {
          subscriptionPlanId: Number(selectedPlanId),
        }
      });

      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['company-gst', gstId] });
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred while processing the subscription. Please try again or contact support.');
    }
  };

  const isSubmitting = purchaseSub.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 1 && (isNewPurchase ? 'Buy Subscription' : 'Select New Subscription Plan')}
            {step === 2 && (isNewPurchase ? 'Complete Purchase' : 'Complete Upgrade')}
          </h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Close" 
            disabled={isSubmitting}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {step === 1 && (
          <form onSubmit={handleNextStep1}>
            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="planId">
                  SUBSCRIPTION PLAN
                </label>
                <select
                  id="planId"
                  className={styles.input}
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>{isNewPurchase ? 'Select a subscription plan' : 'Select a plan to upgrade to'}</option>
                  {isLoadingPlans ? (
                    <option disabled>Loading...</option>
                  ) : (
                    (isNewPurchase ? plans : plans?.filter(p => !p.name.toLowerCase().includes('basic')))?.map((p: SubscriptionPlanResponse) => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.planAmount}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={!selectedPlanId}>
                Next: Payment
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitFinal}>
            <div className={styles.body}>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                {isNewPurchase
                  ? 'You have selected a subscription plan. Please complete your payment to activate this entity.'
                  : 'You are about to upgrade your subscription. Please complete your payment to activate the new plan.'}
              </p>
              
              <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount:</span>
                  <span style={{ fontWeight: 600 }}>
                    ₹{plans?.find((p: SubscriptionPlanResponse) => p.id === selectedPlanId)?.planAmount || 0}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                  {errorMessage}
                </p>
              )}
            </div>
            
            <div className={styles.footer}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (isNewPurchase ? 'Simulate Payment & Activate' : 'Simulate Payment & Upgrade')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useCreateCompanyGST } from '../../hooks/useCreateCompanyGST';
import { usePurchaseSubscription } from '../../hooks/usePurchaseSubscription';
import type { SubscriptionPlanResponse } from '../../types/subscription.types';
import styles from '../ConnectEntityModal/ConnectEntityModal.module.css';
import { useQueryClient } from '@tanstack/react-query';

interface AddGSTModalProps {
  companyId: number;
  onClose: () => void;
}

export function AddGSTModal({ companyId, onClose }: AddGSTModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // GST Details State
  const [gstin, setGstin] = useState('');
  const [isEInvoiceApplicable, setIsEInvoiceApplicable] = useState<boolean>(false);
  const [effectiveDate, setEffectiveDate] = useState('');

  // Subscription Plan State
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: plans, isLoading: isLoadingPlans } = useSubscriptions();
  const queryClient = useQueryClient();

  // Mutations
  const createGst = useCreateCompanyGST();
  const purchaseSub = usePurchaseSubscription();

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (gstin) {
      if (isEInvoiceApplicable && !effectiveDate) {
        alert("Please enter an effective date for e-invoicing.");
        return;
      }
      setStep(2);
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanId) {
      setStep(3);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Helper to format Date to LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
    const formatLocalDateTime = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    try {
      // 1. Create GST record
      const gstResponse = await createGst.mutateAsync({
        companyId,
        gstNumber: gstin.toUpperCase(),
      });

      // 2. Purchase Subscription
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      await purchaseSub.mutateAsync({
        id: gstResponse.id,
        data: {
          subscriptionPlanId: Number(selectedPlanId),
          startDate: formatLocalDateTime(today),
          endDate: formatLocalDateTime(nextYear),
        }
      });

      // After successful mapping, refresh the dashboard lists
      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
      
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage("Could not connect entity. The GSTIN number is likely already registered in the system (GST numbers must be unique) or there is an authorization issue with the remote server.");
      } else {
        setErrorMessage(err.response?.data?.message || err.message || "An error occurred while adding the GST details.");
      }
    }
  };

  const isSubmitting = createGst.isPending || purchaseSub.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 1 && 'Add GST Details'}
            {step === 2 && 'Select Subscription Plan'}
            {step === 3 && 'Complete Purchase'}
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
        
        {/* STEP 1: Add GST Details */}
        {step === 1 && (
          <form onSubmit={handleNextStep1}>
            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="gstin">
                  GSTIN NUMBER
                </label>
                <input
                  id="gstin"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 27AAACV1234F"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  IS E-INVOICE BILL APPLICABLE?
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: `1px solid ${isEInvoiceApplicable ? '#5a6acf' : '#cbd5e1'}`, borderRadius: '6px', cursor: 'pointer', flex: 1, justifyContent: 'center', background: isEInvoiceApplicable ? 'rgba(90, 106, 207, 0.05)' : 'transparent' }}>
                    <input type="radio" name="eInvoice" checked={isEInvoiceApplicable} onChange={() => setIsEInvoiceApplicable(true)} style={{ display: 'none' }} />
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: `1px solid ${!isEInvoiceApplicable ? '#5a6acf' : '#cbd5e1'}`, borderRadius: '6px', cursor: 'pointer', flex: 1, justifyContent: 'center', background: !isEInvoiceApplicable ? 'rgba(90, 106, 207, 0.05)' : 'transparent' }}>
                    <input type="radio" name="eInvoice" checked={!isEInvoiceApplicable} onChange={() => setIsEInvoiceApplicable(false)} style={{ display: 'none' }} />
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    No
                  </label>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="effectiveDate">
                  EFFECTIVE DATE FOR E-INVOICE
                </label>
                <input
                  id="effectiveDate"
                  type="date"
                  className={styles.input}
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  disabled={!isEInvoiceApplicable}
                  required={isEInvoiceApplicable}
                />
              </div>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={!gstin || (isEInvoiceApplicable && !effectiveDate)}>
                Next: Select Plan
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Select Subscription Plan */}
        {step === 2 && (
          <form onSubmit={handleNextStep2}>
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
                  <option value="" disabled>Select a plan</option>
                  {isLoadingPlans ? (
                    <option disabled>Loading...</option>
                  ) : (
                    plans?.map((p: SubscriptionPlanResponse) => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.planAmount}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={() => setStep(1)}>Back</button>
              <button type="submit" className={styles.submitBtn} disabled={!selectedPlanId}>
                Next: Payment
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Purchase */}
        {step === 3 && (
          <form onSubmit={handleSubmitFinal}>
            <div className={styles.body}>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                You have selected the subscription plan. Please complete your payment to activate this entity.
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
                onClick={() => setStep(2)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Simulate Payment & Activate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

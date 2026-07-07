import React, { useState } from 'react';
import { useCompanies } from '../../hooks/useCompanies';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useCreateCompany } from '../../hooks/useCreateCompany';
import { useCreateCompanyGST } from '../../hooks/useCreateCompanyGST';
import { usePurchaseSubscription } from '../../hooks/usePurchaseSubscription';
import type { CompanyProfileResponse } from '../../types/company.types';
import type { SubscriptionPlanResponse } from '../../types/subscription.types';
import styles from './ConnectEntityModal.module.css';

interface ConnectEntityModalProps {
  onClose: () => void;
}

export function ConnectEntityModal({ onClose }: ConnectEntityModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | 'NEW' | ''>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLogo, setNewCompanyLogo] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  
  const [gstin, setGstin] = useState('');
  const [isEInvoiceApplicable, setIsEInvoiceApplicable] = useState<boolean>(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();
  const { data: plans, isLoading: isLoadingPlans } = useSubscriptions();

  // Mutations
  const createCompany = useCreateCompany();
  const createGst = useCreateCompanyGST();
  const purchaseSub = usePurchaseSubscription();

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompanyId && selectedPlanId) {
      if (selectedCompanyId === 'NEW' && !newCompanyName.trim()) {
        alert("Please enter a company name.");
        return;
      }
      setStep(2);
    }
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would integrate with a payment gateway (Stripe/Razorpay)
    setStep(3);
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
      let companyId: number;

      // 1. Create company if new
      if (selectedCompanyId === 'NEW') {
        const companyRes = await createCompany.mutateAsync({
          companyName: newCompanyName,
          companyLogo: newCompanyLogo || 'https://placehold.co/100',
        });
        companyId = companyRes.id;
      } else {
        companyId = Number(selectedCompanyId);
      }

      // 2. Create GST record
      const gstResponse = await createGst.mutateAsync({
        companyId,
        gstNumber: gstin.toUpperCase(),
      });

      // 3. Purchase Subscription
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

      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage("Could not connect entity. Possible reasons:\n1. The GSTIN number is already registered in the system (GST numbers must be unique).\n2. You do not own the selected company (try choosing '+ Create New Company' instead).");
      } else {
        setErrorMessage(err.response?.data?.message || err.message || "An error occurred while setting up the entity.");
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 1 && 'Select Plan & Company'}
            {step === 2 && 'Complete Purchase'}
            {step === 3 && 'Connect New Entity'}
          </h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Close" 
            disabled={createCompany.isPending || createGst.isPending || purchaseSub.isPending}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* STEP 1: Select Company & Plan */}
        {step === 1 && (
          <form onSubmit={handleNextStep1}>
            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="companyId">
                  SELECT COMPANY
                </label>
                <select
                  id="companyId"
                  className={styles.input}
                  value={selectedCompanyId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCompanyId(val === 'NEW' ? 'NEW' : Number(val));
                  }}
                  required
                >
                  <option value="" disabled>Select a company</option>
                  <option value="NEW">+ Create New Company</option>
                  {isLoadingCompanies ? (
                    <option disabled>Loading...</option>
                  ) : (
                    companies?.map((c: CompanyProfileResponse) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))
                  )}
                </select>
              </div>

              {selectedCompanyId === 'NEW' && (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="newCompanyName">
                      COMPANY NAME
                    </label>
                    <input
                      id="newCompanyName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Acme Corp"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="newCompanyLogo">
                      COMPANY LOGO URL
                    </label>
                    <input
                      id="newCompanyLogo"
                      type="url"
                      className={styles.input}
                      placeholder="e.g. https://logo.clearbit.com/acme.com"
                      value={newCompanyLogo}
                      onChange={(e) => setNewCompanyLogo(e.target.value)}
                    />
                  </div>
                </div>
              )}

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
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={!selectedCompanyId || !selectedPlanId}>
                Next: Payment
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Purchase */}
        {step === 2 && (
          <form onSubmit={handleSimulatePayment}>
            <div className={styles.body}>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                You have selected the subscription plan. Please complete your payment to proceed with connecting your entity.
              </p>
              
              <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount:</span>
                  <span style={{ fontWeight: 600 }}>
                    ₹{plans?.find((p: SubscriptionPlanResponse) => p.id === selectedPlanId)?.planAmount || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={() => setStep(1)}>Back</button>
              <button type="submit" className={styles.submitBtn}>
                Simulate Payment & Continue
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Connect Entity (GST Details) */}
        {step === 3 && (
          <form onSubmit={handleSubmitFinal}>
            <div className={styles.body}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
                Add a new business entity to your GST Architect dashboard to start reconciliation.
              </p>
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
                onClick={onClose}
                disabled={createCompany.isPending || createGst.isPending || purchaseSub.isPending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={createCompany.isPending || createGst.isPending || purchaseSub.isPending || !gstin || (isEInvoiceApplicable && !effectiveDate)}
              >
                {createCompany.isPending || createGst.isPending || purchaseSub.isPending ? 'Connecting...' : 'Connect Entity'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

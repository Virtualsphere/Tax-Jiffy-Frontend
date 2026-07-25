import { useState, useEffect, useCallback } from 'react';
import { useGstr1SubmitPayload, useSubmitGstr1 } from '@/pages/dashboard/gstr1/hooks/useGstr1Submit';
import type { Gstr1SubmitRequest } from '@/pages/dashboard/gstr1/types/gstr1-api.types';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';

interface Gstr1SubmitModalProps {
  filingId: number;
  /** Pre-filled GSTIN from current entity */
  prefillGstin?: string;
  /** Pre-filled return period e.g. "012025" */
  prefillRetPeriod?: string;
  /** Pre-filled state code derived from GSTIN (first 2 chars) */
  prefillStateCd?: string;
  /** Called with the ARN when submission succeeds */
  onSuccess: (arn: string) => void;
  /** Called when modal is dismissed */
  onClose: () => void;
}

const EMPTY_FORM: Gstr1SubmitRequest = {
  email: '',
  gstin: '',
  retPeriod: '',
  gstUsername: '',
  stateCd: '',
  ipAddress: '',
  txn: '',
  clientId: '',
  clientSecret: '',
  grossTurnover: 0,
  currentGrossTurnover: 0,
};

export function Gstr1SubmitModal({
  filingId,
  prefillGstin = '',
  prefillRetPeriod = '',
  prefillStateCd = '',
  onSuccess,
  onClose,
}: Gstr1SubmitModalProps) {
  const [form, setForm] = useState<Gstr1SubmitRequest>({
    ...EMPTY_FORM,
    gstin: prefillGstin,
    retPeriod: prefillRetPeriod,
    stateCd: prefillStateCd,
  });
  const [payloadExpanded, setPayloadExpanded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch payload preview when user expands the preview panel
  const payloadQuery = useGstr1SubmitPayload(
    filingId,
    form.grossTurnover,
    form.currentGrossTurnover,
    payloadExpanded,
  );

  const submitMutation = useSubmitGstr1(filingId);

  // Sync prefill props if they change
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      gstin: prefillGstin || prev.gstin,
      retPeriod: prefillRetPeriod || prev.retPeriod,
      stateCd: prefillStateCd || prev.stateCd,
    }));
  }, [prefillGstin, prefillRetPeriod, prefillStateCd]);

  const handleChange = useCallback(
    (field: keyof Gstr1SubmitRequest, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    try {
      const result = await submitMutation.mutateAsync(form);
      if (result?.arn) {
        onSuccess(result.arn);
      } else {
        setSubmitError(result?.message || 'Submission failed — no ARN received.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred during submission.';
      setSubmitError(msg);
    }
  }, [form, submitMutation, onSuccess]);

  const isSubmitting = submitMutation.isPending;
  const canSubmit =
    form.email &&
    form.gstin &&
    form.retPeriod &&
    form.gstUsername &&
    form.txn &&
    form.clientId &&
    form.clientSecret &&
    !isSubmitting;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalHeaderIcon}>📤</div>
            <div>
              <h2 id="submit-modal-title" className={styles.modalTitle}>Submit GSTR-1</h2>
              <p className={styles.modalSubtitle}>
                Enter your GST portal credentials to submit the return. Filing ID: <strong>{filingId}</strong>
              </p>
            </div>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* ── Credentials Section ── */}
          <div className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>
              <span className={styles.modalSectionDot} />
              GST Portal Credentials
            </h3>
            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-email">Email</label>
                <input
                  id="sm-email"
                  type="email"
                  className={styles.modalInput}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-gstin">GSTIN</label>
                <input
                  id="sm-gstin"
                  type="text"
                  className={styles.modalInput}
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-retPeriod">
                  Return Period <span className={styles.modalLabelHint}>(MMYYYY)</span>
                </label>
                <input
                  id="sm-retPeriod"
                  type="text"
                  className={styles.modalInput}
                  placeholder="012025"
                  value={form.retPeriod}
                  onChange={(e) => handleChange('retPeriod', e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-gstUsername">GST Username</label>
                <input
                  id="sm-gstUsername"
                  type="text"
                  className={styles.modalInput}
                  placeholder="your_gst_username"
                  value={form.gstUsername}
                  onChange={(e) => handleChange('gstUsername', e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-stateCd">State Code</label>
                <input
                  id="sm-stateCd"
                  type="text"
                  className={styles.modalInput}
                  placeholder="e.g. 27"
                  value={form.stateCd}
                  onChange={(e) => handleChange('stateCd', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-ipAddress">IP Address</label>
                <input
                  id="sm-ipAddress"
                  type="text"
                  className={styles.modalInput}
                  placeholder="192.168.1.1"
                  value={form.ipAddress}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-txn">TXN / OTP</label>
                <input
                  id="sm-txn"
                  type="text"
                  className={styles.modalInput}
                  placeholder="Transaction / OTP token"
                  value={form.txn}
                  onChange={(e) => handleChange('txn', e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-clientId">Client ID</label>
                <input
                  id="sm-clientId"
                  type="text"
                  className={styles.modalInput}
                  placeholder="API Client ID"
                  value={form.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                />
              </div>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label className={styles.modalLabel} htmlFor="sm-clientSecret">Client Secret</label>
                <input
                  id="sm-clientSecret"
                  type="password"
                  className={styles.modalInput}
                  placeholder="API Client Secret"
                  value={form.clientSecret}
                  onChange={(e) => handleChange('clientSecret', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Turnover Section ── */}
          <div className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>
              <span className={styles.modalSectionDot} />
              Turnover Details
            </h3>
            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-grossTurnover">Gross Turnover (₹)</label>
                <input
                  id="sm-grossTurnover"
                  type="number"
                  className={styles.modalInput}
                  placeholder="0"
                  min={0}
                  value={form.grossTurnover}
                  onChange={(e) => handleChange('grossTurnover', Number(e.target.value))}
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="sm-currentGrossTurnover">Current Gross Turnover (₹)</label>
                <input
                  id="sm-currentGrossTurnover"
                  type="number"
                  className={styles.modalInput}
                  placeholder="0"
                  min={0}
                  value={form.currentGrossTurnover}
                  onChange={(e) => handleChange('currentGrossTurnover', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* ── Payload Preview Section ── */}
          <div className={styles.modalSection}>
            <button
              type="button"
              className={styles.payloadToggle}
              onClick={() => setPayloadExpanded((p) => !p)}
              aria-expanded={payloadExpanded}
            >
              <span className={styles.payloadToggleIcon}>{payloadExpanded ? '▾' : '▸'}</span>
              <span className={styles.payloadToggleLabel}>Preview Submission Payload</span>
              {payloadQuery.isFetching && <span className={styles.payloadBadgeLoading}>loading…</span>}
              {payloadQuery.isSuccess && !payloadQuery.isFetching && (
                <span className={styles.payloadBadgeReady}>ready</span>
              )}
            </button>

            {payloadExpanded && (
              <div className={styles.payloadPreviewBox}>
                {payloadQuery.isLoading || payloadQuery.isFetching ? (
                  <div className={styles.payloadLoader}>
                    <div className={styles.parsingSpinner} />
                    <span>Fetching payload from server…</span>
                  </div>
                ) : payloadQuery.isError ? (
                  <div className={styles.payloadError}>
                    ⚠ Could not load payload preview. Check your network and try again.
                  </div>
                ) : payloadQuery.data ? (
                  <pre className={styles.payloadJson}>
                    {JSON.stringify(payloadQuery.data.data ?? payloadQuery.data, null, 2)}
                  </pre>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Error Banner ── */}
          {submitError && (
            <div className={styles.submitErrorBanner}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.submitErrorIcon}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            id="gstr1-submit-btn"
            className={styles.modalSubmitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <span className={styles.modalSubmitSpinner} />
                Submitting…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l8 8-8 8M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit to GST Portal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

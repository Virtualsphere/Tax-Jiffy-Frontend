import { useState, useCallback } from 'react';
import { useGstr1SubmitPayload, useSubmitGstr1 } from '@/pages/dashboard/gstr1/hooks/useGstr1Submit';
import type { Gstr1SubmitRequest } from '@/pages/dashboard/gstr1/types/gstr1-api.types';
import { useGstSessionGate } from '@/hooks/useGstSessionGate';
import { apiErrorMessage } from '@/lib/gst-session.api';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';

interface Gstr1SubmitModalProps {
  filingId: number;
  /** CompanyGST id of the active entity (the GST portal session is kept per GSTIN). */
  companyGstId: number;
  /** GSTIN of the active entity, shown in the OTP dialog */
  gstin?: string;
  /** Called with the ARN when submission succeeds */
  onSuccess: (arn: string) => void;
  /** Called when modal is dismissed */
  onClose: () => void;
}

const EMPTY_FORM: Gstr1SubmitRequest = {
  grossTurnover: 0,
  currentGrossTurnover: 0,
};

/**
 * GST API keys and the session token live on the server. If the GSTIN has no active
 * GST portal session, submitting opens the OTP dialog and continues after verification.
 */
export function Gstr1SubmitModal({
  filingId,
  companyGstId,
  gstin,
  onSuccess,
  onClose,
}: Gstr1SubmitModalProps) {
  const [form, setForm] = useState<Gstr1SubmitRequest>(EMPTY_FORM);
  const [payloadExpanded, setPayloadExpanded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const gstGate = useGstSessionGate(companyGstId, gstin);

  // Fetch payload preview when user expands the preview panel
  const payloadQuery = useGstr1SubmitPayload(
    filingId,
    form.grossTurnover,
    form.currentGrossTurnover,
    payloadExpanded,
  );

  const submitMutation = useSubmitGstr1(filingId);

  const handleChange = useCallback(
    (field: keyof Gstr1SubmitRequest, value: number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    try {
      const result = await gstGate.run(() => submitMutation.mutateAsync(form));
      if (result === undefined) return; // user closed the OTP dialog
      if (result?.success && result.arn) {
        onSuccess(result.arn);
      } else {
        setSubmitError(result?.message || 'Submission failed — no ARN received.');
      }
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'An unexpected error occurred during submission.'));
    }
  }, [form, submitMutation, onSuccess, gstGate]);

  const isSubmitting = submitMutation.isPending;
  const canSubmit = !isSubmitting;

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
                You may be asked for an OTP from the GST portal. Filing ID: <strong>{filingId}</strong>
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
      {gstGate.dialog}
    </div>
  );
}

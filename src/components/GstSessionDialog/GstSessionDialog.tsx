import { useEffect, useState } from 'react';
import { apiErrorMessage, gstSessionApi, type GstSessionStatus } from '@/lib/gst-session.api';
import styles from './GstSessionDialog.module.css';

type Props = {
  companyGstId: number;
  gstin?: string;
  /** Called once the OTP is verified and the session is active. */
  onConnected: (status: GstSessionStatus) => void;
  onClose: () => void;
};

/**
 * Connects a GSTIN to the GST portal: enter the GST portal username, send an OTP to the
 * taxpayer's registered mobile/email, then verify it. The backend keeps the session.
 */
export function GstSessionDialog({ companyGstId, gstin, onConnected, onClose }: Props) {
  const [step, setStep] = useState<'username' | 'otp'>('username');
  const [gstUsername, setGstUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the username used last time for this GSTIN
  useEffect(() => {
    let cancelled = false;
    gstSessionApi
      .getStatus(companyGstId)
      .then((s) => {
        if (!cancelled && s.gstUsername) setGstUsername(s.gstUsername);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [companyGstId]);

  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await gstSessionApi.requestOtp(companyGstId, gstUsername.trim());
      setOtp('');
      setStep('otp');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send OTP.'));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const status = await gstSessionApi.verifyOtp(companyGstId, otp.trim());
      onConnected(status);
    } catch (err) {
      setError(apiErrorMessage(err, 'OTP verification failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="gst-session-title">
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div>
            <h2 id="gst-session-title" className={styles.title}>Connect to GST portal</h2>
            {gstin && <p className={styles.subtitle}>GSTIN {gstin}</p>}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close" disabled={busy}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {step === 'username' ? (
            <>
              <p className={styles.help}>
                The GST portal sends a one-time password to the taxpayer&apos;s registered mobile and email.
                The connection then stays active for about 6 hours.
              </p>
              <label className={styles.label} htmlFor="gst-session-username">GST portal username</label>
              <input
                id="gst-session-username"
                className={styles.input}
                value={gstUsername}
                onChange={(e) => setGstUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && gstUsername.trim() && !busy && sendOtp()}
                placeholder="Username used to log in to gst.gov.in"
                autoFocus
                autoComplete="off"
              />
              <p className={styles.note}>
                API access must be enabled for this GSTIN on the GST portal
                (My Profile → Manage API Access → Yes).
              </p>
            </>
          ) : (
            <>
              <p className={styles.help}>
                Enter the OTP sent to the registered mobile/email for <strong>{gstUsername}</strong>.
              </p>
              <label className={styles.label} htmlFor="gst-session-otp">OTP</label>
              <input
                id="gst-session-otp"
                className={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && otp.trim() && !busy && verify()}
                inputMode="numeric"
                maxLength={8}
                placeholder="6-digit OTP"
                autoFocus
                autoComplete="one-time-code"
              />
              <button type="button" className={styles.link} onClick={sendOtp} disabled={busy}>
                Resend OTP
              </button>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          {step === 'otp' && (
            <button type="button" className={styles.secondary} onClick={() => setStep('username')} disabled={busy}>
              Back
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          {step === 'username' ? (
            <button type="button" className={styles.primary} onClick={sendOtp} disabled={busy || !gstUsername.trim()}>
              {busy ? 'Sending…' : 'Send OTP'}
            </button>
          ) : (
            <button type="button" className={styles.primary} onClick={verify} disabled={busy || otp.trim().length < 4}>
              {busy ? 'Verifying…' : 'Verify & connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

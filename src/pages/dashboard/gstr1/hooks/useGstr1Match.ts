import { useCallback, useEffect, useRef, useState } from 'react';
import { einvoiceRecoApi } from '@/pages/dashboard/gstr1/api/einvoiceReco.api';
import { handleApiError } from '@/services/api';
import type { Gstr1MatchStats } from '@/pages/dashboard/gstr1/types/gstr1.types';

type UseGstr1MatchReturn = {
  /** Kick off the matching / sync process */
  startMatching: (filingId?: number) => void;
  /** Progress 0–100 (UI animation) */
  progress: number;
  /** Whether matching is currently in progress */
  isMatching: boolean;
  /** Whether matching has completed (stats available) */
  isComplete: boolean;
  /** Match result stats, available after completion */
  matchStats: Gstr1MatchStats | null;
  /** Reset to initial state */
  reset: () => void;
};

export function useGstr1Match(): UseGstr1MatchReturn {
  const [isMatching, setIsMatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [matchStats, setMatchStats] = useState<Gstr1MatchStats | null>(null);

  // Ref to control the animation interval cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated progress bar that runs while the API call is in flight
  useEffect(() => {
    if (!isMatching) return;

    setProgress(0);
    let current = 0;

    intervalRef.current = setInterval(() => {
      // Advance steadily but slow down near the end — never reach 100% until API completes
      const step = current < 85 ? Math.random() * 5 + 2 : 0.3;
      current = Math.min(current + step, 95);
      setProgress(Math.round(current));
    }, 300);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMatching]);

  const startMatching = useCallback(async (filingId?: number) => {
    if (!filingId) {
      console.error('[gstr1] startMatching called without a filingId');
      return;
    }

    setIsComplete(false);
    setMatchStats(null);
    setIsMatching(true);

    try {
      // Reconcile this filing's sale register against synced e-invoices for its period
      // (same call as the Reconciliation tab's "Sync E-Invoices" button).
      await einvoiceRecoApi.syncEInvoiceReco(filingId);
      const results = await einvoiceRecoApi.getReconciliationResult(filingId);

      // Stop the animation, jump to 100%
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);

      const matched = results.filter((r) => r.matchStatus === 'MATCHED').length;
      const mismatched = results.filter((r) => r.matchStatus === 'VALUE_MISMATCH').length;
      const missingInSystem = results.filter((r) => r.matchStatus === 'IN_SALE_REGISTER_ONLY').length;

      setTimeout(() => {
        setIsMatching(false);
        setIsComplete(true);
        setMatchStats({ matched, mismatched, missingInSystem });
      }, 500);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const apiError = handleApiError(err);
      console.error('[gstr1] sync failed:', apiError.message);
      // Even if sync fails, we still allow the user to proceed with local data
      setProgress(100);
      setTimeout(() => {
        setIsMatching(false);
        setIsComplete(true);
        setMatchStats({ matched: 0, mismatched: 0, missingInSystem: 0 });
      }, 500);
    }
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsMatching(false);
    setProgress(0);
    setIsComplete(false);
    setMatchStats(null);
  }, []);

  return {
    startMatching,
    progress,
    isMatching,
    isComplete,
    matchStats,
    reset,
  };
}

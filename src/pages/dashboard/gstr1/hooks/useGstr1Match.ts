import { useCallback, useEffect, useRef, useState } from 'react';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';
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

  const startMatching = useCallback(async (_filingId?: number) => {
    setIsComplete(false);
    setMatchStats(null);
    setIsMatching(true);

    try {
      // POST /api/gstr1/sync — syncs the uploaded data with the GST portal
      // companyGstId is hardcoded to 1 until the Company context is built.
      // financialYear & taxPeriod default to the most common case for now.
      const syncResponse = await gstr1Api.sync({
        companyGstId: 1,
        financialYear: '2023-24',
        taxPeriod: 'OCTOBER',
      });

      // Stop the animation, jump to 100%
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);

      // Derive match statistics from the sync response row counts
      const totalSynced = syncResponse.totalRowsSynced ?? 0;

      setTimeout(() => {
        setIsMatching(false);
        setIsComplete(true);
        setMatchStats({
          matched: totalSynced,
          mismatched: 0,
          missingInSystem: 0,
        });
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

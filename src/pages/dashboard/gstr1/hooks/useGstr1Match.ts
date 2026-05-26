import { useCallback, useEffect, useState } from 'react';
import { MOCK_MATCH_STATS } from '@/pages/dashboard/gstr1/data/gstr1.mock';
import type { Gstr1MatchStats } from '@/pages/dashboard/gstr1/types/gstr1.types';

// TODO: Replace with real matching API call + polling/WebSocket.
// When backend is ready:
//   1. POST /gstr1/match → starts matching job, returns jobId
//   2. GET /gstr1/match/:jobId/status → poll for progress
//   3. GET /gstr1/match/:jobId/result → final match stats

type UseGstr1MatchReturn = {
  /** Kick off the matching process */
  startMatching: () => void;
  /** Progress 0–100 */
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

  // TODO: Replace this useEffect with polling logic against the real API
  useEffect(() => {
    if (!isMatching) return;

    setProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      // Increment by random amount (2-8%) for realistic feel
      current += Math.random() * 6 + 2;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        // Short pause at 100% then mark complete
        setTimeout(() => {
          setIsMatching(false);
          setIsComplete(true);
          setMatchStats(MOCK_MATCH_STATS);
        }, 500);
      } else {
        setProgress(Math.round(current));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isMatching]);

  const startMatching = useCallback(() => {
    setIsComplete(false);
    setMatchStats(null);
    setIsMatching(true);
  }, []);

  const reset = useCallback(() => {
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

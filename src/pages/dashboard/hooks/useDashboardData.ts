import {
  MOCK_QUICK_ACTIONS,
  MOCK_STAT_VALUES,
  MOCK_USER_NAME,
} from '@/pages/dashboard/data/dashboard.mock';
import type { DashboardQuickAction } from '@/pages/dashboard/types/dashboard.types';

// TODO: Replace with useQuery(['dashboard', 'stats'], dashboardApi.getStats)
// when the backend endpoint GET /dashboard/stats is available.

export type DashboardStatItem = {
  label: string;
  value: string;
  emoji: string;
  colorKey: string;
};

type UseDashboardDataReturn = {
  stats: DashboardStatItem[];
  quickActions: DashboardQuickAction[];
  userName: string;
  isLoading: boolean;
  isError: boolean;
  error: null;
};

export function useDashboardData(): UseDashboardDataReturn {
  // TODO: swap with useQuery(['dashboard'], dashboardApi.getData)
  return {
    stats: [...MOCK_STAT_VALUES],
    quickActions: MOCK_QUICK_ACTIONS,
    userName: MOCK_USER_NAME,
    isLoading: false,
    isError: false,
    error: null,
  };
}

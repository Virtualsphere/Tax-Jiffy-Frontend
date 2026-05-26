import { MOCK_DRAFT_DATA } from '@/pages/dashboard/gstr1/data/gstr1.mock';
import type { Gstr1DraftData } from '@/pages/dashboard/gstr1/types/gstr1.types';

// TODO: Replace with useQuery(['gstr1', 'draft'], gstr1Api.getDraft)
// when the backend endpoint GET /gstr1/draft is available.

type UseGstr1DraftReturn = {
  data: Gstr1DraftData;
  isLoading: boolean;
  isError: boolean;
  error: null;
};

export function useGstr1Draft(): UseGstr1DraftReturn {
  // TODO: swap with useQuery(['gstr1', 'draft'], gstr1Api.getDraft)
  return {
    data: MOCK_DRAFT_DATA,
    isLoading: false,
    isError: false,
    error: null,
  };
}

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

/**
 * Returns GSTR-1 draft data.
 * If `parsedData` is provided (from the uploaded Excel), it takes precedence
 * over the default mock data so the UI shows real file contents.
 */
export function useGstr1Draft(parsedData?: Gstr1DraftData): UseGstr1DraftReturn {
  // TODO: swap with useQuery(['gstr1', 'draft'], gstr1Api.getDraft)
  return {
    data: parsedData ?? MOCK_DRAFT_DATA,
    isLoading: false,
    isError: false,
    error: null,
  };
}

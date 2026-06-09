import { MOCK_GSTR2B_DATA } from '../data/gstr2b.mock';
import type { Gstr2bData } from '../types/gstr2b.types';

type UseGstr2bDataReturn = {
  data: Gstr2bData;
  isLoading: boolean;
  isError: boolean;
  error: null;
};

/**
 * Returns GSTR-2B data.
 * Currently uses mock data. Swap out with useQuery when the API is ready.
 */
export function useGstr2bData(): UseGstr2bDataReturn {
  // TODO: swap with useQuery(['gstr2b'], gstr2bApi.getData)
  // when the backend endpoint is available.
  return {
    data: MOCK_GSTR2B_DATA,
    isLoading: false,
    isError: false,
    error: null,
  };
}

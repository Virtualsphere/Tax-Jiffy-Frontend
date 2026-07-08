import { useQuery } from '@tanstack/react-query';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';
import { MOCK_DRAFT_DATA } from '@/pages/dashboard/gstr1/data/gstr1.mock';
import type { Gstr1DraftData } from '@/pages/dashboard/gstr1/types/gstr1.types';

type UseGstr1DraftReturn = {
  data: Gstr1DraftData;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

/**
 * Returns GSTR-1 draft data.
 * If `filingId` is provided, fetches the compiled report from the backend.
 * Otherwise, falls back to the default mock data.
 */
export function useGstr1Draft(filingId?: number): UseGstr1DraftReturn {
  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['gstr1-report', filingId],
    queryFn: () => gstr1Api.getReport(filingId!),
    enabled: !!filingId,
  });

  if (filingId && reportData) {
    const mappedData: Gstr1DraftData = {
      tabs: MOCK_DRAFT_DATA.tabs,
      tabBadges: {
        Basic: null,
        Outward:
          (reportData.outwardData?.table4?.section4A?.length || 0) +
            (reportData.outwardData?.table4?.section4B?.length || 0) +
            (reportData.outwardData?.table4?.section4C?.length || 0) +
            (reportData.outwardData?.table5?.section5A?.length || 0) +
            (reportData.outwardData?.table6?.section6A?.length || 0) || null,
        Amendments:
          (reportData.amendmentsData?.table9?.section9A?.length || 0) +
            (reportData.amendmentsData?.table9?.section9B?.length || 0) +
            (reportData.amendmentsData?.table9?.section9C?.length || 0) || null,
        Advanced: null,
        Others: null,
      },
      rows: reportData.basicData || [],
      filingPeriodYear: MOCK_DRAFT_DATA.filingPeriodYear,
      filingPeriodMonth: MOCK_DRAFT_DATA.filingPeriodMonth,
      outwardData: reportData.outwardData,
      amendmentsData: reportData.amendmentsData,
      advancedData: reportData.advancedData,
      othersData: reportData.othersData,
    };

    return {
      data: mappedData,
      isLoading,
      isError,
      error,
    };
  }

  return {
    data: MOCK_DRAFT_DATA,
    isLoading: false,
    isError: false,
    error: null,
  };
}

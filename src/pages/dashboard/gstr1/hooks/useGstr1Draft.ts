import { useQuery } from '@tanstack/react-query';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';
import type { Gstr1DraftData, Gstr1DraftTab } from '@/pages/dashboard/gstr1/types/gstr1.types';

type UseGstr1DraftReturn = {
  data: Gstr1DraftData;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

const DRAFT_TABS: readonly Gstr1DraftTab[] = ['Basic', 'Outward', 'Amendments', 'Advanced', 'Others'];

const EMPTY_DRAFT_DATA: Gstr1DraftData = {
  tabs: DRAFT_TABS,
  tabBadges: { Basic: null, Outward: null, Amendments: null, Advanced: null, Others: null },
  rows: [],
  filingPeriodYear: '',
  filingPeriodMonth: '',
};

/**
 * Returns GSTR-1 draft data for a filing.
 * If `filingId` is not provided, or no filing exists yet for the selected period,
 * returns an empty draft — never fabricated placeholder data.
 */
export function useGstr1Draft(filingId?: number): UseGstr1DraftReturn {
  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['gstr1-report', filingId],
    queryFn: () => gstr1Api.getReport(filingId!),
    enabled: !!filingId,
  });

  if (filingId && reportData) {
    const mappedData: Gstr1DraftData = {
      tabs: DRAFT_TABS,
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
      filingPeriodYear: '',
      filingPeriodMonth: '',
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
    data: EMPTY_DRAFT_DATA,
    isLoading: !!filingId && isLoading,
    isError,
    error,
  };
}

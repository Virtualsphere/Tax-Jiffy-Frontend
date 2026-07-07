import { useQuery } from '@tanstack/react-query';
import { companyGSTApi } from '@/pages/dashboard/user/api/company-gst.api';

export type CurrentEntity = {
  id: number;
  companyName: string;
  gstin: string;
  location: string;
  period: string;
  isPaymentDone: boolean;
  subscriptionPlanName: string;
};

export function useCurrentEntity() {
  const activeIdStr = localStorage.getItem('active_company_gst_id');
  const activeId = activeIdStr ? Number(activeIdStr) : null;

  const query = useQuery({
    queryKey: ['active-entity', activeId],
    queryFn: async () => {
      if (!activeId) return null;
      const gst = await companyGSTApi.getById(activeId);
      const stateCode = gst.gstNumber.substring(0, 2);
      const stateName = stateCode === '27' ? 'Maharashtra' 
                      : stateCode === '29' ? 'Karnataka' 
                      : stateCode === '07' ? 'Delhi' 
                      : stateCode === '19' ? 'West Bengal' 
                      : 'State (Other)';

      return {
        id: gst.id,
        companyName: gst.companyName,
        gstin: gst.gstNumber,
        location: stateName,
        period: "FEB'2026",
        isPaymentDone: gst.isPaymentDone,
        subscriptionPlanName: gst.subscriptionPlanName,
      };
    },
    enabled: !!activeId,
  });

  const defaultEntity: CurrentEntity = {
    id: 0,
    companyName: 'No Entity Selected',
    gstin: 'N/A',
    location: 'N/A',
    period: 'N/A',
    isPaymentDone: false,
    subscriptionPlanName: '',
  };

  return {
    data: query.data || defaultEntity,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  } as const;
}

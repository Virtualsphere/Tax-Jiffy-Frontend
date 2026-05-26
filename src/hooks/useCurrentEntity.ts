// TODO: Replace mock data with useQuery(() => entityApi.getCurrent())
// when the backend endpoint GET /entity/current is available.

export type CurrentEntity = {
  companyName: string;
  gstin: string;
  location: string;
  period: string;
};

const MOCK_ENTITY: CurrentEntity = {
  companyName: 'VOLLERT INDIA PVT LTD.',
  gstin: '09AADCV5659C1Z5',
  location: 'Uttar Pradesh',
  period: "JUNE'2026",
};

export function useCurrentEntity() {
  // TODO: swap with useQuery(['entity', 'current'], entityApi.getCurrent)
  return {
    data: MOCK_ENTITY,
    isLoading: false,
    isError: false,
    error: null,
  } as const;
}

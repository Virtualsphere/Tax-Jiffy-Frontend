import { useQuery } from '@tanstack/react-query';
import { purchaseRegisterApi } from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';

/** Fetch all 11 parsed sheets for a specific Purchase Register filing */
export function usePurchaseRegisterSheets(filingId: number | null | undefined) {
  const enabled = !!filingId;

  const b2b    = useQuery({ queryKey: ['pr-b2b',    filingId], queryFn: () => purchaseRegisterApi.getB2b(filingId!),    enabled });
  const b2bur  = useQuery({ queryKey: ['pr-b2bur',  filingId], queryFn: () => purchaseRegisterApi.getB2bur(filingId!),  enabled });
  const cdnr   = useQuery({ queryKey: ['pr-cdnr',   filingId], queryFn: () => purchaseRegisterApi.getCdnr(filingId!),   enabled });
  const cdnur  = useQuery({ queryKey: ['pr-cdnur',  filingId], queryFn: () => purchaseRegisterApi.getCdnur(filingId!),  enabled });
  const at     = useQuery({ queryKey: ['pr-at',     filingId], queryFn: () => purchaseRegisterApi.getAt(filingId!),     enabled });
  const atadj  = useQuery({ queryKey: ['pr-atadj',  filingId], queryFn: () => purchaseRegisterApi.getAtadj(filingId!),  enabled });
  const exemp  = useQuery({ queryKey: ['pr-exemp',  filingId], queryFn: () => purchaseRegisterApi.getExemp(filingId!),  enabled });
  const hsnSum = useQuery({ queryKey: ['pr-hsn-sum',filingId], queryFn: () => purchaseRegisterApi.getHsnSum(filingId!), enabled });
  const impg   = useQuery({ queryKey: ['pr-impg',   filingId], queryFn: () => purchaseRegisterApi.getImpg(filingId!),   enabled });
  const imps   = useQuery({ queryKey: ['pr-imps',   filingId], queryFn: () => purchaseRegisterApi.getImps(filingId!),   enabled });
  const itcr   = useQuery({ queryKey: ['pr-itcr',   filingId], queryFn: () => purchaseRegisterApi.getItcr(filingId!),   enabled });

  const isLoading = [b2b, b2bur, cdnr, cdnur, at, atadj, exemp, hsnSum, impg, imps, itcr].some(
    (q) => q.isLoading,
  );

  return {
    b2b:    b2b.data    ?? [],
    b2bur:  b2bur.data  ?? [],
    cdnr:   cdnr.data   ?? [],
    cdnur:  cdnur.data  ?? [],
    at:     at.data     ?? [],
    atadj:  atadj.data  ?? [],
    exemp:  exemp.data  ?? [],
    hsnSum: hsnSum.data ?? [],
    impg:   impg.data   ?? [],
    imps:   imps.data   ?? [],
    itcr:   itcr.data   ?? [],
    isLoading,
  };
}

/** List purchase register filings by companyGST */
export function usePurchaseRegisterFilings(companyGstId: number | null | undefined) {
  return useQuery({
    queryKey: ['pr-filings', companyGstId],
    queryFn: () => purchaseRegisterApi.getFilingsByCompanyGst(companyGstId!),
    enabled: !!companyGstId,
  });
}

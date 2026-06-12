import { useState, useEffect } from 'react';
import { 
  fetchEWayBillList, 
  fetchUnlinkedEWayBills, 
  fetchUnlinkedInvoices, 
  fetchPartiallyMatched 
} from '../data/eWayBill.mock';

export const useEWayBillData = (activeTab: string, globalSearch: string, colFilters: any) => {
  const [listData, setListData] = useState<any[]>([]);
  const [unlinkedEWayBillData, setUnlinkedEWayBillData] = useState<any[]>([]);
  const [unlinkedInvoiceData, setUnlinkedInvoiceData] = useState<any[]>([]);
  const [partiallyMatchedData, setPartiallyMatchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'list') {
          const result = await fetchEWayBillList(globalSearch, colFilters);
          if (isMounted) setListData(result);
        } else if (activeTab === 'unlinked-ewaybill') {
          const result = await fetchUnlinkedEWayBills(globalSearch, colFilters);
          if (isMounted) setUnlinkedEWayBillData(result);
        } else if (activeTab === 'unlinked-invoice') {
          const result = await fetchUnlinkedInvoices(globalSearch, colFilters);
          if (isMounted) setUnlinkedInvoiceData(result);
        } else if (activeTab === 'partially-matched') {
          const result = await fetchPartiallyMatched();
          if (isMounted) setPartiallyMatchedData(result);
        }
      } catch (err) {
        console.error('Failed to fetch e-way bill data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Add a slight debounce to prevent spamming requests on every keystroke
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeTab, globalSearch, colFilters]);

  return { listData, unlinkedEWayBillData, unlinkedInvoiceData, partiallyMatchedData, loading };
};

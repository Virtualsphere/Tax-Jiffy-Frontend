import { useState, useEffect } from 'react';
import { fetchEInvoiceList, fetchUnpairedEInvoices } from '../services/mockEInvoiceApi';

export const useEInvoiceData = (activeTab: string, globalSearch: string, unpairedColFilters: any) => {
  const [listData, setListData] = useState<any[]>([]);
  const [unpairedData, setUnpairedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'list') {
          const result = await fetchEInvoiceList(globalSearch);
          if (isMounted) setListData(result);
        } else if (activeTab === 'unpaired-einvoice' || activeTab === 'unpaired-invoices') {
          const result = await fetchUnpairedEInvoices(globalSearch, unpairedColFilters);
          if (isMounted) setUnpairedData(result);
        }
      } catch (err) {
        console.error('Failed to fetch e-invoice data', err);
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
  }, [activeTab, globalSearch, unpairedColFilters]);

  return { listData, unpairedData, loading };
};

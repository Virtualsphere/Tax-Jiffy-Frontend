export const EINVOICE_LIST_MOCK_DATA = [
  {
    docTypeCode: 'INV',
    documentNo: 'INV/2026/001',
    documentDate: '02/06/2026',
    supplyTypeCode: 'B2B',
    legalName: 'Vollert India Pvt Ltd',
    gstin: '09AADCV5659C1Z5',
    address: 'Plot 42, Sec 18, Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    buyerName: 'Global Systems Inc',
  },
  {
    docTypeCode: 'INV',
    documentNo: 'INV/2026/002',
    documentDate: '05/06/2026',
    supplyTypeCode: 'B2B',
    legalName: 'Vollert India Pvt Ltd',
    gstin: '09AADCV5659C1Z5',
    address: 'Plot 42, Sec 18, Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    buyerName: 'Modern Buildwell Pvt Ltd',
  },
  {
    docTypeCode: 'CRN',
    documentNo: 'CRN/2026/012',
    documentDate: '08/06/2026',
    supplyTypeCode: 'B2B',
    legalName: 'Vollert India Pvt Ltd',
    gstin: '09AADCV5659C1Z5',
    address: 'Plot 42, Sec 18, Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    buyerName: 'Precision Tech LTD',
  },
];

export const UNPAIRED_EINVOICE_MOCK_DATA = [
  {
    gstin: '09AADCV5659C1Z5',
    partyName: 'Acme Solutions Pvt Ltd',
    invoiceNo: 'INV/2026/001',
    invoiceDate: '02/06/2026',
    taxRate: '18%',
    taxableValue: '1,25,000.00',
    cgstValue: '11,250.00',
    sgstValue: '11,250.00',
  },
  {
    gstin: '09AADCV5659C1Z5',
    partyName: 'TechNova Industries',
    invoiceNo: 'INV/2026/002',
    invoiceDate: '05/06/2026',
    taxRate: '18%',
    taxableValue: '85,000.00',
    cgstValue: '7,650.00',
    sgstValue: '7,650.00',
  },
  {
    gstin: '09AADCV5659C1Z5',
    partyName: 'Global Trading Corp',
    invoiceNo: 'CRN/2026/012',
    invoiceDate: '08/06/2026',
    taxRate: '18%',
    taxableValue: '12,000.00',
    cgstValue: '1,080.00',
    sgstValue: '1,080.00',
  },
  {
    gstin: '09AADCV5659C1Z5',
    partyName: 'Zenith Enterprises',
    invoiceNo: 'INV/2026/015',
    invoiceDate: '12/06/2026',
    taxRate: '18%',
    taxableValue: '5,40,000.00',
    cgstValue: '0.00',
    sgstValue: '0.00',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchEInvoiceList = async (globalSearch: string) => {
  await delay(600); // simulate network latency
  
  return EINVOICE_LIST_MOCK_DATA.filter((row) => {
    if (!globalSearch) return true;
    const term = globalSearch.toLowerCase();
    return Object.values(row).some(val => String(val).toLowerCase().includes(term));
  });
};

export const fetchUnpairedEInvoices = async (globalSearch: string, colFilters: any) => {
  await delay(600);
  
  return UNPAIRED_EINVOICE_MOCK_DATA.filter((row) => {
    // Global Search
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      const matchesGlobal = Object.values(row).some(val => String(val).toLowerCase().includes(term));
      if (!matchesGlobal) return false;
    }
    
    // Column Filters
    for (const [col, query] of Object.entries(colFilters)) {
      if (query) {
        const val = String(row[col as keyof typeof row] || '').toLowerCase();
        if (!val.includes((query as string).toLowerCase())) return false;
      }
    }
    
    return true;
  });
};

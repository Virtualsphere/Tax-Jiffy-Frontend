export const LIST_MOCK_DATA = [
  {
    ewayBillNo: '121548796325',
    ewbDateTime: '24-Oct-2023 14:30',
    docType: 'INV',
    docDate: '23-Oct-2023',
    partyGstin: '27AAACV1234F1Z5',
    transporterGstin: '27ABCDE1234A1Z1',
    status: 'ACTIVE',
    value: '1,50,000.00'
  },
  {
    ewayBillNo: '121548796336',
    ewbDateTime: '24-Oct-2023 16:15',
    docType: 'INV',
    docDate: '24-Oct-2023',
    partyGstin: '07AAAAA0000A1Z5',
    transporterGstin: '07BBBBB1111B1Z2',
    status: 'PENDING',
    value: '2,10,100.00'
  },
  {
    ewayBillNo: '121548796401',
    ewbDateTime: '25-Oct-2023 09:00',
    docType: 'INV',
    docDate: '25-Oct-2023',
    partyGstin: '29CCCCC2222C1Z3',
    transporterGstin: '29DDDDD3333D1Z4',
    status: 'EXPIRING',
    value: '85,000.00'
  }
];

export const UNLINKED_MOCK_DATA = [
  {
    ewayBillNo: '128956743210',
    ewbDateTime: '26-Oct-2023 11:20',
    docType: 'INV',
    docDate: '25-Oct-2023',
    partyGstin: '27AABCV5678D1Z4',
    transporterGstin: '27ABCDE1234A1Z1',
    status: 'ACTIVE',
    value: '2,45,000.00'
  },
  {
    ewayBillNo: '128956743211',
    ewbDateTime: '26-Oct-2023 13:45',
    docType: 'INV',
    docDate: '26-Oct-2023',
    partyGstin: '07GHIJK9012L1Z9',
    transporterGstin: '07BBBBB1111B1Z2',
    status: 'PENDING',
    value: '89,200.00'
  },
  {
    ewayBillNo: '128956743212',
    ewbDateTime: '27-Oct-2023 09:10',
    docType: 'INV',
    docDate: '26-Oct-2023',
    partyGstin: '29LMNOP3456Q1Z0',
    transporterGstin: '29DDDDD3333D1Z4',
    status: 'ACTIVE',
    value: '5,12,000.00'
  },
  {
    ewayBillNo: '128956743213',
    ewbDateTime: '27-Oct-2023 10:30',
    docType: 'INV',
    docDate: '27-Oct-2023',
    partyGstin: '33QRRTY7890V1Z2',
    transporterGstin: '27ABCDE1234A1Z1',
    status: 'EXPIRING',
    value: '1,28,500.00'
  },
  {
    ewayBillNo: '128956743214',
    ewbDateTime: '27-Oct-2023 15:55',
    docType: 'INV',
    docDate: '27-Oct-2023',
    partyGstin: '27WXYZA1234B1Z5',
    transporterGstin: '07BBBBB1111B1Z2',
    status: 'ACTIVE',
    value: '3,42,100.00'
  }
];

export const UNLINKED_INVOICE_MOCK_DATA = [
  {
    docNo: 'INV/23-24/00125',
    docDate: '25-Oct-2023',
    docType: 'Tax Invoice',
    partyGstin: '27AABCV5678D1Z4',
    assessableValue: '2,45,000.00',
    sgstValue: '12,250.00',
    cgstValue: '12,250.00'
  },
  {
    docNo: 'INV/23-24/00126',
    docDate: '26-Oct-2023',
    docType: 'Tax Invoice',
    partyGstin: '07GHIJK9012L1Z9',
    assessableValue: '89,200.00',
    sgstValue: '0.00',
    cgstValue: '0.00'
  },
  {
    docNo: 'INV/23-24/00127',
    docDate: '26-Oct-2023',
    docType: 'Tax Invoice',
    partyGstin: '29LMNOP3456Q1Z0',
    assessableValue: '5,12,000.00',
    sgstValue: '0.00',
    cgstValue: '0.00'
  },
  {
    docNo: 'INV/23-24/00128',
    docDate: '27-Oct-2023',
    docType: 'Tax Invoice',
    partyGstin: '33QRRTY7890V1Z2',
    assessableValue: '1,28,500.00',
    sgstValue: '11,565.00',
    cgstValue: '11,565.00'
  },
  {
    docNo: 'INV/23-24/00129',
    docDate: '27-Oct-2023',
    docType: 'Tax Invoice',
    partyGstin: '27WXYZA1234B1Z5',
    assessableValue: '3,42,100.00',
    sgstValue: '0.00',
    cgstValue: '0.00'
  }
];

export const PARTIALLY_MATCHED_MOCK_DATA = [
  {
    type: 'ONE-TO-MANY',
    title: 'INV-2024-0012',
    status: 'PARTIALLY MATCHED',
    recordBlocks: [
      {
        parent: {
          gstin: '27AAACV1234F1Z5',
          docType: 'INV',
          docNo: 'INV-2024-0012',
          date: '12-Mar-2024',
          assessableValue: '1,25,000.00',
          sgstValue: '11,250.00',
          cgstValue: '11,250.00',
          igstValue: '0.00',
          totalValue: '1,47,500.00'
        },
        children: [
          {
            gstin: 'Recipient Unit A',
            docType: 'EWB',
            docNo: '1214-5582-9012',
            date: '13-Mar-2024',
            assessableValue: '40,000.00',
            sgstValue: '3,600.00',
            cgstValue: '3,600.00',
            igstValue: '0.00',
            totalValue: '47,200.00'
          },
          {
            gstin: 'Recipient Unit B',
            docType: 'EWB',
            docNo: '1214-5582-9013',
            date: '13-Mar-2024',
            assessableValue: '40,000.00',
            sgstValue: '3,600.00',
            cgstValue: '3,600.00',
            igstValue: '0.00',
            totalValue: '47,200.00'
          }
        ],
        totals: {
          assessableValue: '80,000.00',
          sgstValue: '7,200.00',
          cgstValue: '7,200.00',
          igstValue: '0.00',
          totalValue: '94,400.00'
        }
      },
      {
        parent: {
          gstin: '27AAACV1234F1Z5',
          docType: 'INV',
          docNo: 'INV-2024-0012',
          date: '12-Mar-2024',
          assessableValue: '1,25,000.00',
          sgstValue: '11,250.00',
          cgstValue: '11,250.00',
          igstValue: '0.00',
          totalValue: '1,47,500.00'
        },
        children: [
          {
            gstin: 'Recipient Unit A',
            docType: 'EWB',
            docNo: '1214-5582-9012',
            date: '13-Mar-2024',
            assessableValue: '40,000.00',
            sgstValue: '3,600.00',
            cgstValue: '3,600.00',
            igstValue: '0.00',
            totalValue: '47,200.00'
          },
          {
            gstin: 'Recipient Unit B',
            docType: 'EWB',
            docNo: '1214-5582-9013',
            date: '13-Mar-2024',
            assessableValue: '40,000.00',
            sgstValue: '3,600.00',
            cgstValue: '3,600.00',
            igstValue: '0.00',
            totalValue: '47,200.00'
          }
        ],
        totals: {
          assessableValue: '80,000.00',
          sgstValue: '7,200.00',
          cgstValue: '7,200.00',
          igstValue: '0.00',
          totalValue: '94,400.00'
        }
      }
    ]
  },
  {
    type: 'MANY-TO-ONE',
    title: 'EWB-991200331',
    status: 'PARTIALLY MATCHED',
    recordBlocks: [
      {
        parent: {
          gstin: 'Consolidated Logistics',
          docType: 'EWB',
          docNo: 'EWB-991200331',
          date: '15-Mar-2024',
          assessableValue: '2,00,000.00',
          sgstValue: '0.00',
          cgstValue: '0.00',
          igstValue: '36,000.00',
          totalValue: '2,36,000.00'
        },
        children: [
          {
            gstin: '07GHIJK9012L1Z9',
            docType: 'INV',
            docNo: 'INV/23/00881',
            date: '14-Mar-2024',
            assessableValue: '1,00,000.00',
            sgstValue: '0.00',
            cgstValue: '0.00',
            igstValue: '18,000.00',
            totalValue: '1,18,000.00'
          },
          {
            gstin: '27WXYZA1234B1Z5',
            docType: 'INV',
            docNo: 'INV/23/00882',
            date: '14-Mar-2024',
            assessableValue: '1,00,000.00',
            sgstValue: '0.00',
            cgstValue: '0.00',
            igstValue: '18,000.00',
            totalValue: '1,18,000.00'
          }
        ],
        totals: {
          assessableValue: '2,00,000.00',
          sgstValue: '0.00',
          cgstValue: '0.00',
          igstValue: '36,000.00',
          totalValue: '2,36,000.00'
        }
      }
    ]
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const applyFilters = (data: any[], globalSearch: string, colFilters: any) => {
  return data.filter(row => {
    // Global search
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      const matchesGlobal = Object.values(row).some(val => 
        String(val).toLowerCase().includes(query)
      );
      if (!matchesGlobal) return false;
    }
    
    // Column filters
    for (const [col, query] of Object.entries(colFilters || {})) {
      if (query) {
        const val = String(row[col as keyof typeof row] || '').toLowerCase();
        if (!val.includes((query as string).toLowerCase())) return false;
      }
    }
    
    return true;
  });
};

export const fetchEWayBillList = async (globalSearch: string, colFilters: any) => {
  await delay(600);
  return applyFilters(LIST_MOCK_DATA, globalSearch, colFilters);
};

export const fetchUnlinkedEWayBills = async (globalSearch: string, colFilters: any) => {
  await delay(600);
  return applyFilters(UNLINKED_MOCK_DATA, globalSearch, colFilters);
};

export const fetchUnlinkedInvoices = async (globalSearch: string, colFilters: any) => {
  await delay(600);
  return applyFilters(UNLINKED_INVOICE_MOCK_DATA, globalSearch, colFilters);
};

export const fetchPartiallyMatched = async () => {
  await delay(600);
  // Reusing the same structure but skipping deep filtering on partially matched since it's hierarchical in the UI design.
  return PARTIALLY_MATCHED_MOCK_DATA;
};

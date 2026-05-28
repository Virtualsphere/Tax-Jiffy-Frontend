import type {
  Gstr1DraftData,
  Gstr1DraftRow,
  Gstr1DraftTab,
  Gstr1MatchStats,
} from '@/pages/dashboard/gstr1/types/gstr1.types';

export const MOCK_DRAFT_TABS: readonly Gstr1DraftTab[] = [
  'Basic',
  'Outward',
  'Amendments',
  'Advanced',
  'Others',
];

export const MOCK_DRAFT_TAB_BADGES: Record<string, number | null> = {
  Basic: null,
  Outward: 3,
  Amendments: 2,
  Advanced: null,
  Others: null,
};

export const MOCK_DRAFT_ROWS: Gstr1DraftRow[] = [
  {
    sr: '1',
    label: 'GSTIN',
    sub: 'Goods and Services Tax Identification Number',
    value: '27AAACR1234A 1Z5',
    highlight: true,
  },
  {
    sr: '2(a)',
    label: 'Legal Name',
    sub: 'As per PAN database',
    value: 'GLOBAL SOLUTIONS PRIVATE LIMITED',
    highlight: false,
  },
  {
    sr: '2(b)',
    label: 'Trade Name',
    sub: 'If different from legal name',
    value: 'GLOBAL TECH SERVICES',
    highlight: false,
  },
  {
    sr: '3(a)',
    label: 'Aggregate Turnover (Preceding FY)',
    sub: 'Turnover for financial year 2022-23',
    value: '₹ 4,50,00,000.00',
    highlight: false,
  },
  {
    sr: '3(b)',
    label: 'Aggregate Turnover (Apr-Jun 2017)',
    sub: 'Historical turnover context',
    value: '₹ 1,20,00,000.00',
    highlight: false,
  },
];

export const MOCK_MATCH_STATS: Gstr1MatchStats = {
  matched: 4450,
  mismatched: 32,
  missingInSystem: 20,
};

export const MOCK_OUTWARD_DATA = {
  table4: {
    section4A: [
      {
        gstin: '07BBBB1111B2ZG',
        invoiceNo: 'INV/23-24/1022',
        invoiceDate: '14-Oct-2023',
        invoiceValue: '2,10,000.00',
        taxableValue: '2,00,000.00',
        igst: '10,000.00',
        cgst: '0.00',
        sgst: '0.00',
        cess: '0.00',
        pos: 'Delhi (07)',
      },
      {
        gstin: '27AAAAA0000A1Z5',
        invoiceNo: 'INV/23-24/1021',
        invoiceDate: '12-Oct-2023',
        invoiceValue: '1,18,000.00',
        taxableValue: '1,00,000.00',
        igst: '0.00',
        cgst: '9,000.00',
        sgst: '9,000.00',
        cess: '0.00',
        pos: 'Maharashtra (27)',
      },
    ],
    section4B: [
      {
        gstin: '33DDDD3333D4Z8',
        invoiceNo: 'INV/23-24/1024',
        invoiceDate: '18-Oct-2023',
        invoiceValue: '1,40,000.00',
        taxableValue: '1,00,000.00',
        igst: '28,000.00',
        cgst: '0.00',
        sgst: '0.00',
        cess: '12,000.00',
        pos: 'Tamil Nadu (33)',
      },
    ],
    section4C_ecommerceGstin: '29ECOM1234E1Z1',
    section4C: [
      {
        gstin: '19EEEE4444E5Z9',
        invoiceNo: 'INV/23-24/1025',
        invoiceDate: '20-Oct-2023',
        invoiceValue: '75,000.00',
        taxableValue: '63,559.00',
        igst: '11,441.00',
        cgst: '0.00',
        sgst: '0.00',
        cess: '0.00',
        pos: 'West Bengal (19)',
      },
    ],
    total: {
      invoiceValue: '5,43,000.00',
      taxableValue: '4,63,559.00',
      igst: '49,441.00',
      cgst: '9,000.00',
      sgst: '9,000.00',
      cess: '12,000.00',
    },
  },
  table5: {
    section5A: [
      {
        pos: 'Karnataka (29)',
        invoiceNo: '—',
        invoiceDate: '—',
        invoiceValue: '3,24,500.00',
        rate: '18',
        taxableValue: '2,75,000.00',
        igst: '49,500.00',
      },
      {
        pos: 'Maharashtra (27)',
        invoiceNo: '—',
        invoiceDate: '—',
        invoiceValue: '2,95,000.00',
        rate: '18',
        taxableValue: '2,50,000.00',
        igst: '45,000.00',
      },
    ],
    section5B_ecommerceGstin: '29ECOM1234E1Z1',
    section5B: [
      {
        gstin: '27AAACN0000Z1ZP',
        pos: 'West Bengal (19)',
        invoiceNo: '—',
        invoiceDate: '—',
        invoiceValue: '2,80,000.00',
        rate: '12',
        taxableValue: '2,50,000.00',
        igst: '30,000.00',
      },
    ],
    total: {
      invoiceValue: '8,99,500.00',
      taxableValue: '7,75,000.00',
      igst: '1,24,500.00',
    },
  },
  table6: {
    section6A: [
      {
        gstin: '—',
        invoiceNo: 'EXP/23-24/089',
        invoiceDate: '12-Oct-23',
        invoiceValue: '125000.00',
        sbNo: '9823412',
        sbDate: '15-Oct-23',
        rate: '18%',
        taxableValue: '125000.00',
        amt: '22500.00',
      },
    ],
    section6B: [
      {
        gstin: '27AAACZ1234A1Z5',
        invoiceNo: 'SEZ/03/442',
        invoiceDate: '18-Oct-23',
        invoiceValue: '85000.00',
        sbNo: '—',
        sbDate: '—',
        rate: '12%',
        taxableValue: '45000.00',
        amt: '5400.00',
      },
      {
        gstin: '',
        invoiceNo: '',
        invoiceDate: '',
        invoiceValue: '',
        sbNo: '—',
        sbDate: '—',
        rate: '18%',
        taxableValue: '40000.00',
        amt: '7200.00',
      },
    ],
    section6C: [
      {
        gstin: '27AABSC9876J1Z2',
        invoiceNo: 'DE/OCT/005',
        invoiceDate: '22-Oct-23',
        invoiceValue: '210000.00',
        sbNo: '—',
        sbDate: '—',
        rate: '5%',
        taxableValue: '210000.00',
        amt: '10500.00',
      },
    ],
  },
  table7: {
    section7A1: [
      { rate: '5%', taxableValue: '1,25,000.00', integrated: '0.00', central: '3,125.00', state: '3,125.00' },
      { rate: '12%', taxableValue: '85,400.00', integrated: '0.00', central: '5,124.00', state: '5,124.00' },
      { rate: '18%', taxableValue: '4,50,000.00', integrated: '0.00', central: '40,500.00', state: '40,500.00' },
      { rate: '28%', taxableValue: '12,000.00', integrated: '0.00', central: '1,680.00', state: '1,680.00' },
    ],
    section7A2_ecommerceGstin: '27AAAAA000CA1Z5',
    section7A2: [
      { gstin: '27AAAAA000CA1Z5', rate: '18%', taxableValue: '45,000.00', integrated: '0.00', central: '4,050.00', state: '4,050.00' },
    ],
    section7B1_pos: 'Maharashtra (27), Karnataka (29)',
    section7B1: [
      { stateName: '12% (Maharashtra)', rate: '12%', taxableValue: '25,000.00', integrated: '3,000.00', central: '0.00', state: '0.00' },
      { stateName: '18% (Karnataka)', rate: '18%', taxableValue: '60,000.00', integrated: '10,800.00', central: '0.00', state: '0.00' },
    ],
    section7B2_ecommerceGstin: '29BBBB1111B1Z2',
    section7B2: [
      { gstin: '29BBBB1111B1Z2', rate: '18%', taxableValue: '15,000.00', integrated: '2,700.00', central: '0.00', state: '0.00' },
    ],
  },
  table8: {
    section8A: { label: '8A. Inter-State supplies to registered persons', nilRated: '0.00', exempted: '0.00', nonGst: '' },
    section8B: { label: '8B. Intra-State supplies to registered persons', nilRated: '15,000.00', exempted: '4,500.00', nonGst: '' },
    section8C: { label: '8C. Inter-State supplies to unregistered persons', nilRated: '0.00', exempted: '0.00', nonGst: '' },
    section8D: { label: '8D. Intra-State supplies to unregistered persons', nilRated: '0.00', exempted: '0.00', nonGst: '' },
    total: { label: 'Total', nilRated: '15,000.00', exempted: '4,500.00', nonGst: '' },
  },
};

export const MOCK_AMENDMENTS_DATA = {
  table9: {
    section9A: [
      {
        originalGstin: '07AABCC1234D1Z5',
        originalInvNo: 'INV-2023-089',
        originalInvDate: '15-Sep-2023',
        revisedGstin: '07AABCC1234D1Z5',
        revisedInvNo: 'INV-2023-089R',
        revisedInvDate: '12-Oct-2023',
        sbNo: '-',
        sbDate: '-',
        value: '1,25,000',
        rate: '18',
        taxableValue: '1,25,000',
        integratedTax: '22,500',
      },
    ],
    section9B: [
      {
        originalGstin: '09AAACC5678F1Z2',
        originalInvNo: 'INV-2023-045',
        originalInvDate: '05-Aug-2023',
        revisedGstin: '09AAACC5678F1Z2',
        revisedInvNo: 'CN-2023-012',
        revisedInvDate: '15-Oct-2023',
        sbNo: '-',
        sbDate: '-',
        value: '-15,000',
        rate: '12',
        taxableValue: '-15,000',
        integratedTax: '',
      },
    ],
    section9C: [
      {
        originalGstin: '33DDDEE4321A1Z0',
        originalInvNo: 'CN-2023-005',
        originalInvDate: '02-Sep-2023',
        revisedGstin: '33DDDEE4321A1Z0',
        revisedInvNo: 'CN-2023-005A',
        revisedInvDate: '18-Oct-2023',
        sbNo: '-',
        sbDate: '-',
        value: '45,000',
        rate: '5',
        taxableValue: '45,000',
        integratedTax: '2,250',
      },
    ],
  },
  table10: {
    section10A: [
      { rate: '18', taxableValue: '5,50,000', integrated: '0', central: '49,500', state: '49,500' },
      { rate: '12', taxableValue: '1,20,000', integrated: '0', central: '7,200', state: '7,200' },
    ],
    section10A1_ecommerceGstin: '07ABCDE1234F1Z5 (Amazon)',
    section10A1: [
      { rate: '18', taxableValue: '45,000', integrated: '0', central: '4,050', state: '4,050' },
    ],
    section10B_pos: 'Karnataka (29)',
    section10B: [
      { rate: '18', taxableValue: '2,10,000', integrated: '37,800', central: '0', state: '0' },
    ],
    section10B1_ecommerceGstin: '29GHIJK5678L1Z9 (Flipkart)',
    section10B1: [
      { rate: '12', taxableValue: '35,000', integrated: '4,200', central: '0', state: '0' },
    ],
  },
};

export const MOCK_ADVANCED_DATA = {
  table11: {
    section11A1: [
      { rate: '5%', grossAdvance: '2,50,000.00', pos: '09-Uttar Pradesh', integrated: '0.00', central: '6,250.00', state: '6,250.00', cess: '0.00' },
      { rate: '12%', grossAdvance: '1,20,000.00', pos: '09-Uttar Pradesh', integrated: '0.00', central: '7,200.00', state: '7,200.00', cess: '0.00' },
      { rate: '18%', grossAdvance: '4,00,000.00', pos: '09-Uttar Pradesh', integrated: '0.00', central: '36,000.00', state: '36,000.00', cess: '0.00' },
    ],
    section11A2: [
      { rate: '18%', grossAdvance: '5,00,000.00', pos: '27-Maharashtra', integrated: '90,000.00', central: '0.00', state: '0.00', cess: '0.00' },
    ],
    section11B1: [
      { rate: '18%', grossAdvance: '1,00,000.00', pos: '09-Uttar Pradesh', integrated: '0.00', central: '9,000.00', state: '9,000.00', cess: '0.00' },
    ],
    section11B2: [
      { rate: '12%', grossAdvance: '50,000.00', pos: '33-Tamil Nadu', integrated: '6,000.00', central: '0.00', state: '0.00', cess: '0.00' },
    ],
    amendments: [
      { month: '', amendmentRelatingTo: 'No Records Found', val11A1: '-', val11A2: '-', val11B1: '-', val11B2: '-' },
    ],
  },
};

export const MOCK_OTHERS_DATA = {
  table12: {
    records: [
      { hsn: '8415', description: 'Air Conditioning Machines', uqc: 'PCS', totalQuantity: '120.00', totalValue: '450000.00', taxableValue: '381355.93', integratedTax: '0.00', centralTax: '34322.03', stateTax: '34322.03', cess: '0.00' },
      { hsn: '8516', description: 'Electric Water Heaters', uqc: 'PCS', totalQuantity: '45.00', totalValue: '135000.00', taxableValue: '114406.78', integratedTax: '20593.22', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
      { hsn: '8418', description: 'Refrigerators, Freezers', uqc: 'PCS', totalQuantity: '28.00', totalValue: '280000.00', taxableValue: '237288.14', integratedTax: '0.00', centralTax: '21355.93', stateTax: '21355.93', cess: '0.00' },
    ],
    total: {
      totalQuantity: '193.00',
      totalValue: '865000.00',
      taxableValue: '733050.85',
      integratedTax: '20593.22',
      centralTax: '55677.96',
      stateTax: '55677.96',
      cess: '0.00',
    },
  },
  table13: {
    records: [
      { natureOfDocument: 'Invoices for outward supply', from: '1001', to: '1250', totalNumber: '250', cancelled: '5', netIssued: '245' },
      { natureOfDocument: 'Invoices for inward supply from unregistered person', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Revised Invoice', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Debit Note', from: 'DN-01', to: 'DN-12', totalNumber: '12', cancelled: '0', netIssued: '12' },
      { natureOfDocument: 'Credit Note', from: 'CN-01', to: 'CN-08', totalNumber: '8', cancelled: '0', netIssued: '8' },
      { natureOfDocument: 'Receipt voucher', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Payment Voucher', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Refund voucher', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Delivery Challan for job work', from: 'CH-22', to: 'CH-35', totalNumber: '14', cancelled: '1', netIssued: '13' },
      { natureOfDocument: 'Delivery Challan for supply on approval', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Delivery Challan in case of liquid gas', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
      { natureOfDocument: 'Delivery Challan in cases other than by way of supply', from: '-', to: '-', totalNumber: '0', cancelled: '0', netIssued: '0' },
    ],
  },
};

export const MOCK_DRAFT_DATA: Gstr1DraftData = {
  tabs: MOCK_DRAFT_TABS,
  tabBadges: MOCK_DRAFT_TAB_BADGES,
  rows: MOCK_DRAFT_ROWS,
  filingPeriodYear: '2023-24',
  filingPeriodMonth: 'October',
  outwardData: MOCK_OUTWARD_DATA,
  amendmentsData: MOCK_AMENDMENTS_DATA,
  advancedData: MOCK_ADVANCED_DATA,
  othersData: MOCK_OTHERS_DATA,
};

export const MOCK_FILING_ARN = 'AA270626001234Z';

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

export const MOCK_DRAFT_DATA: Gstr1DraftData = {
  tabs: MOCK_DRAFT_TABS,
  tabBadges: MOCK_DRAFT_TAB_BADGES,
  rows: MOCK_DRAFT_ROWS,
  filingPeriodYear: '2023-24',
  filingPeriodMonth: 'October',
};

export const MOCK_FILING_ARN = 'AA270626001234Z';

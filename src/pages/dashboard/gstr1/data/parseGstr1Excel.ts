/**
 * parseGstr1Excel.ts
 *
 * Client-side parser for the GSTR-1 Excel template (V2.0).
 * Reads the uploaded .xlsx / .xls workbook and maps each sheet into the
 * existing Gstr1DraftData shape so the UI renders live data immediately
 * after upload — no backend round-trip required at this stage.
 *
 * Sheet → Section mapping:
 *  b2b,sez,de  →  Outward Table 4 (B2B / SEZ / Deemed Exports)
 *  b2cl        →  Outward Table 5 (B2CL inter-state > ₹2.5L)
 *  b2cs        →  Outward Table 7 (B2CS consolidated)
 *  exp         →  Outward Table 6 (Exports / Zero-rated)
 *  exemp       →  Outward Table 8 (Nil / Exempt / Non-GST)
 *  b2ba        →  Amendments Table 9 (B2B amendments)
 *  cdnr        →  Amendments Table 9B (CDN registered)
 *  cdnra       →  Amendments Table 9C (CDN amendments registered)
 *  cdnur       →  Amendments Table 9B (CDN unregistered)
 *  cdnura      →  Amendments Table 9C (CDN amendments unregistered)
 *  at          →  Advanced Table 11 (Advance received)
 *  atadj       →  Advanced Table 11 (Advance adjusted)
 *  hsn         →  Others Table 12 (HSN summary)
 *  docs        →  Others Table 13 (Documents issued)
 */

import * as XLSX from 'xlsx';
import type {
  Gstr1DraftData,
  Gstr1DraftRow,
  Gstr1OutwardRecord,
  Gstr1OutwardTable4,
  Gstr1OutwardTable5,
  Gstr1OutwardTable5Record,
  Gstr1OutwardTable6,
  Gstr1OutwardTable6Record,
  Gstr1OutwardTable7,
  Gstr1OutwardTable8,
  Gstr1OutwardData,
  Gstr1AmendmentsTable9,
  Gstr1AmendmentsTable9Record,
  Gstr1AmendmentsTable10,
  Gstr1AmendmentsData,
  Gstr1AdvancedTable11,
  Gstr1AdvancedTable11Record,
  Gstr1AdvancedData,
  Gstr1OthersTable12,
  Gstr1OthersTable12Record,
  Gstr1OthersTable13,
  Gstr1OthersData,
} from '@/pages/dashboard/gstr1/types/gstr1.types';
import { MOCK_DRAFT_DATA } from '@/pages/dashboard/gstr1/data/gstr1.mock';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RawRow = (string | number | boolean | null | undefined)[];

type CellVal = string | number | boolean | null | undefined;

/** Read a sheet as an array-of-arrays (raw, no header conversion). */
function getSheetRows(wb: XLSX.WorkBook, sheetName: string): RawRow[] {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<RawRow>(ws, {
    header: 1,
    defval: '',
    blankrows: false,
  });
}

/** Convert an Excel serial date number to DD-Mon-YYYY string (e.g. "14-Oct-2023"). */
function excelDateToStr(val: CellVal): string {
  if (val === '' || val == null || typeof val === 'boolean') return '—';
  const n = Number(val);
  if (isNaN(n) || n < 1) return String(val);
  const date = XLSX.SSF.parse_date_code(n);
  if (!date) return String(val);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(date.d).padStart(2, '0');
  const mon = months[date.m - 1] ?? '';
  return `${dd}-${mon}-${date.y}`;
}

/** Format a numeric value as Indian accounting string (e.g. "1,00,000.00"). */
function fmtNum(val: CellVal): string {
  if (val === '' || val == null || typeof val === 'boolean') return '0.00';
  const n = Number(val);
  if (isNaN(n)) return String(val) || '0.00';
  // Format with 2 decimal places, then convert to Indian grouping
  const fixed = Math.abs(n).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  let result = '';
  const digits = intPart.split('').reverse();
  digits.forEach((d, i) => {
    if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) result = ',' + result;
    result = d + result;
  });
  return (n < 0 ? '-' : '') + result + '.' + decPart;
}

function strVal(val: CellVal): string {
  if (val == null || val === '' || typeof val === 'boolean') return '—';
  return String(val);
}

/** Find the first data row index (after the header row) in a sheet.
 *  The GSTR-1 template has a fixed header structure: row 0 = section title,
 *  row 1-2 = summary, row 3 = column headers, row 4+ = data.
 */
const DATA_START_ROW = 4;

// ---------------------------------------------------------------------------
// Basic tab — pulled from b2b summary rows + master sheet
// ---------------------------------------------------------------------------
function buildBasicRows(_wb: XLSX.WorkBook): Gstr1DraftRow[] {
  // The GSTR-1 template does NOT store company info in any sheet;
  // return mock values for the Basic tab.
  return MOCK_DRAFT_DATA.rows;
}

// ---------------------------------------------------------------------------
// Outward Table 4: b2b,sez,de sheet
// ---------------------------------------------------------------------------
function buildTable4(wb: XLSX.WorkBook): Gstr1OutwardTable4 {
  const rows = getSheetRows(wb, 'b2b,sez,de');
  const data = rows.slice(DATA_START_ROW);

  const section4A: Gstr1OutwardRecord[] = [];
  const section4B: Gstr1OutwardRecord[] = [];
  let section4C_ecommerceGstin = '';
  const section4C: Gstr1OutwardRecord[] = [];

  let totalInvoiceValue = 0;
  let totalTaxableValue = 0;
  let totalIgst = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalCess = 0;

  for (const row of data) {
    const gstin = strVal(row[0]);
    const invoiceNo = strVal(row[2]);
    const invoiceDate = excelDateToStr(row[3]);
    const invoiceValue = fmtNum(row[4]);
    const pos = strVal(row[5]);
    const reverseCharge = strVal(row[6]);
    const invoiceType = strVal(row[8]);
    const ecomGstin = strVal(row[9]);
    const rate = Number(row[10]) || 0;
    const taxableValue = fmtNum(row[11]);
    const cess = fmtNum(row[12]);

    const invVal = Number(row[4]) || 0;
    const taxVal = Number(row[11]) || 0;
    const cessVal = Number(row[12]) || 0;

    totalInvoiceValue += invVal;
    totalTaxableValue += taxVal;
    totalCess += cessVal;

    // Determine IGST vs CGST+SGST based on POS vs supplier state
    // Simplified: if POS differs from supplier state code (or export), use IGST
    // We'll compute based on whether it's inter-state (common heuristic: if rate > 0 and it's export/SEZ or inter-state)
    const isInterState = invoiceType.includes('SEZ') || invoiceType.includes('Deemed') || invoiceType.toLowerCase().includes('igst');
    const taxAmount = (taxVal * rate) / 100;
    let igst = '0.00', cgst = '0.00', sgst = '0.00';

    if (isInterState) {
      igst = fmtNum(taxAmount);
      totalIgst += taxAmount;
    } else {
      cgst = fmtNum(taxAmount / 2);
      sgst = fmtNum(taxAmount / 2);
      totalCgst += taxAmount / 2;
      totalSgst += taxAmount / 2;
    }

    const record: Gstr1OutwardRecord = {
      gstin,
      invoiceNo,
      invoiceDate,
      invoiceValue,
      taxableValue,
      igst,
      cgst,
      sgst,
      cess,
      pos,
    };

    if (invoiceType === 'Regular B2B' && reverseCharge === 'N') {
      section4A.push(record);
    } else if (reverseCharge === 'Y') {
      section4B.push(record);
    } else if (invoiceType.includes('E-Commerce') || ecomGstin !== '—') {
      if (!section4C_ecommerceGstin && ecomGstin !== '—') {
        section4C_ecommerceGstin = ecomGstin;
      }
      section4C.push(record);
    } else {
      // SEZ / Deemed Exp go to 4A as well by default
      section4A.push(record);
    }
  }

  // If all sections are empty, use at least first few in 4A
  if (section4A.length === 0 && section4B.length === 0 && section4C.length === 0) {
    return MOCK_DRAFT_DATA.outwardData!.table4;
  }

  return {
    section4A,
    section4B,
    section4C_ecommerceGstin: section4C_ecommerceGstin || '—',
    section4C,
    total: {
      invoiceValue: fmtNum(totalInvoiceValue),
      taxableValue: fmtNum(totalTaxableValue),
      igst: fmtNum(totalIgst),
      cgst: fmtNum(totalCgst),
      sgst: fmtNum(totalSgst),
      cess: fmtNum(totalCess),
    },
  };
}

// ---------------------------------------------------------------------------
// Outward Table 5: b2cl sheet
// ---------------------------------------------------------------------------
function buildTable5(wb: XLSX.WorkBook): Gstr1OutwardTable5 {
  const rows = getSheetRows(wb, 'b2cl');
  const data = rows.slice(DATA_START_ROW);

  const section5A: Gstr1OutwardTable5Record[] = [];

  let totalInvoiceValue = 0;
  let totalTaxableValue = 0;
  let totalIgst = 0;

  for (const row of data) {
    const invoiceNo = strVal(row[0]);
    const invoiceDate = excelDateToStr(row[1]);
    const invoiceValue = fmtNum(row[2]);
    const pos = strVal(row[3]);
    const rate = strVal(row[5]);
    const taxableValue = fmtNum(row[6]);
    const ecomGstin = strVal(row[8]);

    const invVal = Number(row[2]) || 0;
    const taxVal = Number(row[6]) || 0;
    const rateNum = Number(row[5]) || 0;
    const igstVal = (taxVal * rateNum) / 100;

    totalInvoiceValue += invVal;
    totalTaxableValue += taxVal;
    totalIgst += igstVal;

    const record: Gstr1OutwardTable5Record = {
      pos,
      invoiceNo,
      invoiceDate,
      invoiceValue,
      rate: rate || '0',
      taxableValue,
      igst: fmtNum(igstVal),
    };

    if (ecomGstin && ecomGstin !== '—') {
      section5A.push({ ...record, gstin: ecomGstin });
    } else {
      section5A.push(record);
    }
  }

  if (section5A.length === 0) return MOCK_DRAFT_DATA.outwardData!.table5;

  return {
    section5A,
    section5B_ecommerceGstin: '—',
    section5B: [],
    total: {
      invoiceValue: fmtNum(totalInvoiceValue),
      taxableValue: fmtNum(totalTaxableValue),
      igst: fmtNum(totalIgst),
    },
  };
}

// ---------------------------------------------------------------------------
// Outward Table 6: exp sheet
// ---------------------------------------------------------------------------
function buildTable6(wb: XLSX.WorkBook): Gstr1OutwardTable6 {
  const rows = getSheetRows(wb, 'exp');
  const data = rows.slice(DATA_START_ROW);

  const section6A: Gstr1OutwardTable6Record[] = [];
  const section6B: Gstr1OutwardTable6Record[] = [];

  for (const row of data) {
    const exportType = strVal(row[0]);
    const invoiceNo = strVal(row[1]);
    const invoiceDate = excelDateToStr(row[2]);
    const invoiceValue = fmtNum(row[3]);
    const sbNo = strVal(row[5]);
    const sbDate = excelDateToStr(row[6]);
    const rate = strVal(row[7]);
    const taxableValue = fmtNum(row[8]);
    const taxVal = Number(row[8]) || 0;
    const rateNum = Number(row[7]) || 0;
    const amt = fmtNum((taxVal * rateNum) / 100);

    const record: Gstr1OutwardTable6Record = {
      gstin: '—',
      invoiceNo,
      invoiceDate,
      invoiceValue,
      sbNo,
      sbDate,
      rate: `${rate}%`,
      taxableValue,
      amt,
    };

    if (exportType === 'WPAY') {
      section6A.push(record);
    } else {
      section6A.push(record);
    }
  }

  if (section6A.length === 0) return MOCK_DRAFT_DATA.outwardData!.table6;

  return {
    section6A,
    section6B,
    section6C: [],
  };
}

// ---------------------------------------------------------------------------
// Outward Table 7: b2cs sheet
// ---------------------------------------------------------------------------
function buildTable7(wb: XLSX.WorkBook): Gstr1OutwardTable7 {
  const rows = getSheetRows(wb, 'b2cs');
  const data = rows.slice(DATA_START_ROW);

  const section7A1: Gstr1OutwardTable7['section7A1'] = [];
  const section7B1: Gstr1OutwardTable7['section7B1'] = [];

  for (const row of data) {
    const type = strVal(row[0]);
    const pos = strVal(row[1]);
    const rate = strVal(row[3]);
    const taxableValue = fmtNum(row[4]);
    const taxVal = Number(row[4]) || 0;
    const rateNum = Number(row[3]) || 0;
    const tax = (taxVal * rateNum) / 100;

    if (type === 'OE') {
      // Intra-state
      section7A1.push({
        rate: `${rate}%`,
        taxableValue,
        integrated: '0.00',
        central: fmtNum(tax / 2),
        state: fmtNum(tax / 2),
      });
    } else {
      // Inter-state
      section7B1.push({
        stateName: pos,
        rate: `${rate}%`,
        taxableValue,
        integrated: fmtNum(tax),
        central: '0.00',
        state: '0.00',
      });
    }
  }

  if (section7A1.length === 0 && section7B1.length === 0) {
    return MOCK_DRAFT_DATA.outwardData!.table7;
  }

  return {
    section7A1,
    section7A2_ecommerceGstin: '—',
    section7A2: [],
    section7B1_pos: section7B1.map(r => r.stateName).join(', ') || '—',
    section7B1,
    section7B2_ecommerceGstin: '—',
    section7B2: [],
  };
}

// ---------------------------------------------------------------------------
// Outward Table 8: exemp sheet
// ---------------------------------------------------------------------------
function buildTable8(wb: XLSX.WorkBook): Gstr1OutwardTable8 {
  const rows = getSheetRows(wb, 'exemp');
  const data = rows.slice(DATA_START_ROW);

  const labels = [
    '8A. Inter-State supplies to registered persons',
    '8B. Intra-State supplies to registered persons',
    '8C. Inter-State supplies to unregistered persons',
    '8D. Intra-State supplies to unregistered persons',
  ];

  const sections = ['section8A', 'section8B', 'section8C', 'section8D'] as const;

  let totalNil = 0, totalExempt = 0, totalNonGst = 0;
  const result: Record<string, { label: string; nilRated: string; exempted: string; nonGst: string }> = {};

  data.forEach((row, idx) => {
    const label = labels[idx] ?? strVal(row[0]);
    const nil = Number(row[1]) || 0;
    const exempt = Number(row[2]) || 0;
    const nonGst = Number(row[3]) || 0;
    totalNil += nil;
    totalExempt += exempt;
    totalNonGst += nonGst;
    if (sections[idx]) {
      result[sections[idx]] = {
        label,
        nilRated: fmtNum(nil),
        exempted: fmtNum(exempt),
        nonGst: fmtNum(nonGst),
      };
    }
  });

  const fallback = MOCK_DRAFT_DATA.outwardData!.table8;
  return {
    section8A: result.section8A ?? fallback.section8A,
    section8B: result.section8B ?? fallback.section8B,
    section8C: result.section8C ?? fallback.section8C,
    section8D: result.section8D ?? fallback.section8D,
    total: {
      label: 'Total',
      nilRated: fmtNum(totalNil),
      exempted: fmtNum(totalExempt),
      nonGst: fmtNum(totalNonGst),
    },
  };
}

// ---------------------------------------------------------------------------
// Amendments Table 9: b2ba + cdnr + cdnra sheets
// ---------------------------------------------------------------------------
function buildTable9(wb: XLSX.WorkBook): Gstr1AmendmentsTable9 {
  // 9A: B2B amendments (b2ba)
  const b2baRows = getSheetRows(wb, 'b2ba').slice(DATA_START_ROW);
  const section9A: Gstr1AmendmentsTable9Record[] = b2baRows.map(row => ({
    originalGstin: strVal(row[0]),
    originalInvNo: strVal(row[2]),
    originalInvDate: excelDateToStr(row[3]),
    revisedGstin: strVal(row[0]),
    revisedInvNo: strVal(row[4]),
    revisedInvDate: excelDateToStr(row[5]),
    sbNo: '—',
    sbDate: '—',
    value: fmtNum(row[6]),
    rate: strVal(row[12]),
    taxableValue: fmtNum(row[13]),
    integratedTax: '—',
  }));

  // 9B: CDN registered (cdnr) — debit/credit notes
  const cdnrRows = getSheetRows(wb, 'cdnr').slice(DATA_START_ROW);
  const section9B: Gstr1AmendmentsTable9Record[] = cdnrRows.map(row => ({
    originalGstin: strVal(row[0]),
    originalInvNo: strVal(row[2]),
    originalInvDate: excelDateToStr(row[3]),
    revisedGstin: strVal(row[0]),
    revisedInvNo: strVal(row[2]),
    revisedInvDate: excelDateToStr(row[3]),
    sbNo: '—',
    sbDate: '—',
    value: fmtNum(row[8]),
    rate: strVal(row[10]),
    taxableValue: fmtNum(row[11]),
    integratedTax: fmtNum((Number(row[11]) || 0) * (Number(row[10]) || 0) / 100),
  }));

  // 9C: CDN amendments (cdnra)
  const cdnraRows = getSheetRows(wb, 'cdnra').slice(DATA_START_ROW);
  const section9C: Gstr1AmendmentsTable9Record[] = cdnraRows.map(row => ({
    originalGstin: strVal(row[0]),
    originalInvNo: strVal(row[2]),
    originalInvDate: excelDateToStr(row[3]),
    revisedGstin: strVal(row[0]),
    revisedInvNo: strVal(row[4]),
    revisedInvDate: excelDateToStr(row[5]),
    sbNo: '—',
    sbDate: '—',
    value: fmtNum(row[10]),
    rate: strVal(row[12]),
    taxableValue: fmtNum(row[13]),
    integratedTax: fmtNum((Number(row[13]) || 0) * (Number(row[12]) || 0) / 100),
  }));

  const mock = MOCK_DRAFT_DATA.amendmentsData!.table9;
  return {
    section9A: section9A.length > 0 ? section9A : mock.section9A,
    section9B: section9B.length > 0 ? section9B : mock.section9B,
    section9C: section9C.length > 0 ? section9C : mock.section9C,
  };
}

// ---------------------------------------------------------------------------
// Amendments Table 10: b2cla + b2csa sheets (simplified mapping)
// ---------------------------------------------------------------------------
function buildTable10(wb: XLSX.WorkBook): Gstr1AmendmentsTable10 {
  const b2claRows = getSheetRows(wb, 'b2cla').slice(DATA_START_ROW);
  const section10A: Gstr1AmendmentsTable10['section10A'] = b2claRows.map(row => ({
    rate: strVal(row[7]),
    taxableValue: fmtNum(row[8]),
    integrated: fmtNum((Number(row[8]) || 0) * (Number(row[7]) || 0) / 100),
    central: '0.00',
    state: '0.00',
  }));

  const mock = MOCK_DRAFT_DATA.amendmentsData!.table10;
  return {
    section10A: section10A.length > 0 ? section10A : mock.section10A,
    section10A1_ecommerceGstin: mock.section10A1_ecommerceGstin,
    section10A1: mock.section10A1,
    section10B_pos: mock.section10B_pos,
    section10B: mock.section10B,
    section10B1_ecommerceGstin: mock.section10B1_ecommerceGstin,
    section10B1: mock.section10B1,
  };
}

// ---------------------------------------------------------------------------
// Advanced Table 11: at + atadj sheets
// ---------------------------------------------------------------------------
function buildTable11(wb: XLSX.WorkBook): Gstr1AdvancedTable11 {
  const atRows = getSheetRows(wb, 'at').slice(DATA_START_ROW);
  const section11A1: Gstr1AdvancedTable11Record[] = atRows.map(row => ({
    rate: `${strVal(row[2])}%`,
    grossAdvance: fmtNum(row[3]),
    pos: strVal(row[0]),
    integrated: '0.00',
    central: fmtNum((Number(row[3]) || 0) * (Number(row[2]) || 0) / 200),
    state: fmtNum((Number(row[3]) || 0) * (Number(row[2]) || 0) / 200),
    cess: fmtNum(row[4]),
  }));

  const atadjRows = getSheetRows(wb, 'atadj').slice(DATA_START_ROW);
  const section11B1: Gstr1AdvancedTable11Record[] = atadjRows.map(row => ({
    rate: `${strVal(row[2])}%`,
    grossAdvance: fmtNum(row[3]),
    pos: strVal(row[0]),
    integrated: '0.00',
    central: fmtNum((Number(row[3]) || 0) * (Number(row[2]) || 0) / 200),
    state: fmtNum((Number(row[3]) || 0) * (Number(row[2]) || 0) / 200),
    cess: fmtNum(row[4]),
  }));

  const mock = MOCK_DRAFT_DATA.advancedData!.table11;
  return {
    section11A1: section11A1.length > 0 ? section11A1 : mock.section11A1,
    section11A2: mock.section11A2,
    section11B1: section11B1.length > 0 ? section11B1 : mock.section11B1,
    section11B2: mock.section11B2,
    amendments: mock.amendments,
  };
}

// ---------------------------------------------------------------------------
// Others Table 12: hsn sheet
// ---------------------------------------------------------------------------
function buildTable12(wb: XLSX.WorkBook): Gstr1OthersTable12 {
  const rows = getSheetRows(wb, 'hsn').slice(DATA_START_ROW);

  let totalQty = 0, totalVal = 0, totalTaxable = 0;
  let totalIgst = 0, totalCgst = 0, totalSgst = 0, totalCess = 0;

  const records: Gstr1OthersTable12Record[] = rows
    .filter(row => row[0] !== '' && row[0] != null)
    .map(row => {
      const qty = Number(row[3]) || 0;
      const val = Number(row[4]) || 0;
      const taxable = Number(row[6]) || 0;
      const igst = Number(row[7]) || 0;
      const cgst = Number(row[8]) || 0;
      const sgst = Number(row[9]) || 0;
      const cess = Number(row[10]) || 0;

      totalQty += qty;
      totalVal += val;
      totalTaxable += taxable;
      totalIgst += igst;
      totalCgst += cgst;
      totalSgst += sgst;
      totalCess += cess;

      return {
        hsn: strVal(row[0]),
        description: strVal(row[1]),
        uqc: strVal(row[2]),
        totalQuantity: fmtNum(qty),
        totalValue: fmtNum(val),
        taxableValue: fmtNum(taxable),
        integratedTax: fmtNum(igst),
        centralTax: fmtNum(cgst),
        stateTax: fmtNum(sgst),
        cess: fmtNum(cess),
      };
    });

  if (records.length === 0) return MOCK_DRAFT_DATA.othersData!.table12;

  return {
    records,
    total: {
      totalQuantity: fmtNum(totalQty),
      totalValue: fmtNum(totalVal),
      taxableValue: fmtNum(totalTaxable),
      integratedTax: fmtNum(totalIgst),
      centralTax: fmtNum(totalCgst),
      stateTax: fmtNum(totalSgst),
      cess: fmtNum(totalCess),
    },
  };
}

// ---------------------------------------------------------------------------
// Others Table 13: docs sheet
// ---------------------------------------------------------------------------
function buildTable13(wb: XLSX.WorkBook): Gstr1OthersTable13 {
  const rows = getSheetRows(wb, 'docs').slice(DATA_START_ROW);
  const records = rows
    .filter(row => row[0] !== '' && row[0] != null)
    .map(row => {
      const total = Number(row[3]) || 0;
      const cancelled = Number(row[4]) || 0;
      return {
        natureOfDocument: strVal(row[0]),
        from: strVal(row[1]),
        to: strVal(row[2]),
        totalNumber: strVal(total),
        cancelled: strVal(cancelled),
        netIssued: strVal(total - cancelled),
      };
    });

  if (records.length === 0) return MOCK_DRAFT_DATA.othersData!.table13;
  return { records };
}

// ---------------------------------------------------------------------------
// Count total data rows for display
// ---------------------------------------------------------------------------
function countDataRows(wb: XLSX.WorkBook): number {
  const dataSheets = ['b2b,sez,de', 'b2cl', 'b2cs', 'exp', 'exemp', 'b2ba', 'cdnr', 'cdnra', 'at', 'atadj', 'hsn', 'docs'];
  let total = 0;
  for (const name of dataSheets) {
    const rows = getSheetRows(wb, name);
    total += Math.max(0, rows.length - DATA_START_ROW);
  }
  return Math.max(1, total);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export interface ParsedGstr1Result {
  draftData: Gstr1DraftData;
  rowCount: number;
}

export async function parseGstr1Excel(file: File): Promise<ParsedGstr1Result> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });

  // Build each section
  const basicRows = buildBasicRows(wb);
  const table4 = buildTable4(wb);
  const table5 = buildTable5(wb);
  const table6 = buildTable6(wb);
  const table7 = buildTable7(wb);
  const table8 = buildTable8(wb);

  const outwardData: Gstr1OutwardData = { table4, table5, table6, table7, table8 };

  const table9 = buildTable9(wb);
  const table10 = buildTable10(wb);
  const amendmentsData: Gstr1AmendmentsData = { table9, table10 };

  const table11 = buildTable11(wb);
  const advancedData: Gstr1AdvancedData = { table11 };

  const table12 = buildTable12(wb);
  const table13 = buildTable13(wb);
  const othersData: Gstr1OthersData = { table12, table13 };

  const rowCount = countDataRows(wb);

  // Determine badge counts from actual data
  const outwardCount = (table4.section4A.length + table4.section4B.length + table4.section4C.length
    + table5.section5A.length + table6.section6A.length);
  const amendmentsCount = table9.section9A.length + table9.section9B.length + table9.section9C.length;

  const draftData: Gstr1DraftData = {
    tabs: MOCK_DRAFT_DATA.tabs,
    tabBadges: {
      Basic: null,
      Outward: outwardCount > 0 ? outwardCount : null,
      Amendments: amendmentsCount > 0 ? amendmentsCount : null,
      Advanced: null,
      Others: null,
    },
    rows: basicRows,
    filingPeriodYear: MOCK_DRAFT_DATA.filingPeriodYear,
    filingPeriodMonth: MOCK_DRAFT_DATA.filingPeriodMonth,
    outwardData,
    amendmentsData,
    advancedData,
    othersData,
  };

  return { draftData, rowCount };
}

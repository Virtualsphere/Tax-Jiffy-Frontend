import type { ValueFormatterParams } from 'ag-grid-community';
import { money } from './reconMeta';
import styles from './Recon.module.css';

/** Amount formatter shared by every plain money column. */
export function moneyFormatter(params: ValueFormatterParams): string {
  if (params.value == null) return '';
  if (!params.value && !params.node?.rowPinned) return '—';
  return money(params.value as number);
}

export function moneyCellClass(params: { value: unknown; node: { rowPinned?: string | null } }): string {
  return !params.value && !params.node.rowPinned ? `${styles.num} ${styles.numNil}` : styles.num;
}

/** dd Mmm yyyy, tolerating both ISO strings and Date values coming off the API. */
export function dateFormatter(params: ValueFormatterParams): string {
  const raw = params.value;
  if (!raw) return params.node?.rowPinned ? '' : '—';
  const parsed = new Date(raw as string);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

import React from 'react';
import styles from './UnifiedTable.module.css';
import type { ICellRendererParams } from 'ag-grid-community';

/**
 * Status vocabularies used across the app, normalised to one set of pill
 * colours. Keys are compared upper-cased with surrounding whitespace removed,
 * so "Accepted", "ACCEPTED" and " accepted " all land in the same bucket.
 */
const GREEN = new Set([
  'POSTED', 'INV', 'ACT', 'ACTIVE', 'ACCEPTED', 'FILED', 'MATCHED', 'SUCCESS', 'PAID', 'COMPLETED',
]);

const YELLOW = new Set([
  'DRAFT', 'PENDING', 'EXPIRING', 'IN PROGRESS', 'INPROGRESS', 'PARTIAL', 'PENDING PAYMENT', 'PAYMENT PENDING', 'PROCESSING',
]);

const RED = new Set([
  'CREDIT NOTE', 'CRN', 'CNL', 'CANCELLED', 'CANCELED', 'REJECTED', 'FAILED', 'ERROR', 'EXPIRED', 'INACTIVE', 'DEACTIVATED',
]);

export function tagClassFor(value: unknown): string {
  const key = String(value ?? '').trim().toUpperCase();
  if (GREEN.has(key)) return styles.tagGreen;
  if (YELLOW.has(key)) return styles.tagYellow;
  if (RED.has(key)) return styles.tagRed;
  return styles.tagGray;
}

export const TagCellRenderer: React.FC<ICellRendererParams> = (props) => {
  const value = props.value;
  if (value == null || value === '') return null;

  return <span className={`${styles.tag} ${tagClassFor(value)}`}>{value}</span>;
};

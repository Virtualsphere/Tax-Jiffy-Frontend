import React from 'react';
import styles from './UnifiedTable.module.css';
import type { ICellRendererParams } from 'ag-grid-community';

export const TagCellRenderer: React.FC<ICellRendererParams> = (props) => {
  const value = props.value;
  if (!value) return null;

  let tagClass = styles.tagGray;
  
  // Status mapping
  if (value === 'Posted' || value === 'INV') {
    tagClass = styles.tagGreen;
  } else if (value === 'Draft' || value === 'Pending') {
    tagClass = styles.tagYellow;
  } else if (value === 'Credit Note' || value === 'CRN') {
    tagClass = styles.tagRed;
  }

  return <span className={`${styles.tag} ${tagClass}`}>{value}</span>;
};

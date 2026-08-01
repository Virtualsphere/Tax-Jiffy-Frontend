import React from 'react';
import styles from './UnifiedTable.module.css';
import type { ICellRendererParams } from 'ag-grid-community';

export const ActionCellRenderer: React.FC<ICellRendererParams> = (props) => {
  return (
    <div className={styles.actionCell}>
      <button 
        type="button" 
        className={styles.actionButton}
        onClick={() => {
          if (props.context && props.context.onActionClick) {
            props.context.onActionClick(props.data);
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="4" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1BasicTabProps {
  data: any[];
}

export function GSTR1BasicTab({ data }: GSTR1BasicTabProps) {
  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'sr', headerName: 'SR.', width: 80, cellClass: styles.draftTdSr },
    { 
      field: 'label', headerName: 'PARTICULARS', flex: 2,
      cellRenderer: (p: any) => (
        <div>
          <span className={styles.draftParticularsLabel}>{p.data.label}</span>
          <br/>
          <span className={styles.draftParticularsSub}>{p.data.sub}</span>
        </div>
      ),
      autoHeight: true
    },
    { 
      field: 'value', headerName: 'DETAILS / VALUES', flex: 1,
      cellRenderer: (p: any) => (
        p.data.highlight ? 
          <span className={styles.draftValueHighlight}>{p.value}</span> : 
          <span className={styles.draftValue}>{p.value}</span>
      )
    }
  ], []);

  return (
    <div className="ag-theme-tax-jiffy" style={{ width: '100%' }}>
      <AgGridReact theme="legacy"
        rowData={data}
        columnDefs={colDefs}
        domLayout="autoHeight"
        suppressMenuHide={true}
      />
    </div>
  );
}

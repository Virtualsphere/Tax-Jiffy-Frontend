import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import styles from './RowActionsRenderer.module.css';

export type RowAction<T> = {
  label: string;
  onClick: (row: T) => void;
  /** `danger` renders the destructive (red) treatment. */
  variant?: 'default' | 'danger';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  title?: string;
};

type RowActionsParams<T> = ICellRendererParams<T> & { actions: RowAction<T>[] };

function RowActionsRenderer<T>({ data, actions }: RowActionsParams<T>) {
  if (!data) return null;

  return (
    <div className={styles.cell}>
      {actions
        .filter((action) => !action.hidden?.(data))
        .map((action) => (
          <button
            key={action.label}
            type="button"
            className={`${styles.button} ${action.variant === 'danger' ? styles.danger : ''}`}
            onClick={() => action.onClick(data)}
            disabled={action.disabled?.(data) ?? false}
            title={action.title}
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}

/**
 * A trailing column of per-row buttons — the edit/delete controls the admin
 * tables previously hand-rolled in their own `<td>` markup.
 */
export function rowActionsColumn<T>(
  actions: RowAction<T>[],
  overrides?: Partial<ColDef>,
): ColDef {
  return {
    headerName: 'Action',
    colId: 'rowActions',
    cellRenderer: RowActionsRenderer,
    cellRendererParams: { actions },
    sortable: false,
    filter: false,
    resizable: false,
    minWidth: 140,
    cellClass: 'ag-cell-right',
    headerClass: 'ag-header-cell-right',
    ...overrides,
  };
}

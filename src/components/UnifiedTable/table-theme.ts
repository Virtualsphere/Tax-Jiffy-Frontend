/**
 * Table sizing shared by every grid.
 *
 * Colours and typography live in src/styles/ag-grid-custom.css as ag-grid's
 * legacy `--ag-*` variables, because the app has ~40 grids on legacy theming
 * and AG Grid cannot run legacy theming and the Theming API side by side.
 * Only the values the toolbar changes at runtime belong here.
 */

/** Row heights behind the density toggle. */
export const ROW_HEIGHT = { comfortable: 48, compact: 36 } as const;

export type TableDensity = keyof typeof ROW_HEIGHT;

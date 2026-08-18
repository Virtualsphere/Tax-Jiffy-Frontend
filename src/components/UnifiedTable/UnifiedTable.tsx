import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Just in case, though they use legacy/custom

import styles from './UnifiedTable.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  name: string;
  options: FilterOption[];
}

export interface UnifiedTableProps {
  title?: string;
  subtitle?: string;
  recordCount?: number;
  rowData: any[];
  columnDefs: ColDef[];
  filters?: FilterConfig[];
  onSearch?: (term: string) => void;
  onFilterChange?: (filterName: string, value: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  topRightDropdownOptions?: FilterOption[];
  onTopRightDropdownChange?: (value: string) => void;
  
  // Pagination
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  hideHeader?: boolean;
  hideFilterBar?: boolean;
  hidePagination?: boolean;
  pinnedBottomRowData?: any[];
  variant?: 'standalone' | 'nested';
  autoWidth?: boolean;
  filterCount?: number;
  showFilterBarInFullscreenOnly?: boolean;
}

export const UnifiedTable: React.FC<UnifiedTableProps> = ({
  title,
  subtitle,
  recordCount: recordCountProp,
  rowData,
  columnDefs,
  filters = [],
  onSearch,
  onFilterChange,
  onExport,
  onRefresh,
  topRightDropdownOptions,
  onTopRightDropdownChange,
  page: pageProp,
  rowsPerPage: rowsPerPageProp,
  onPageChange: onPageChangeProp,
  onRowsPerPageChange: onRowsPerPageChangeProp,
  hideHeader = false,
  hideFilterBar = false,
  hidePagination = false,
  pinnedBottomRowData,
  variant = 'standalone',
  autoWidth = false,
  filterCount = 0,
  showFilterBarInFullscreenOnly = false,
}) => {
  const [gridApi, setGridApi] = useState<any>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const [filterModel, setFilterModel] = useState<Record<string, string>>({});
  
  // 1.3: Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleFullscreen = (full: boolean) => {
    setIsFullscreen(full);
    window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { collapsed: full } }));
  };

  // 1.1: Internal pagination state (uncontrolled mode)
  const [internalPage, setInternalPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(50);
  
  // 1.8: Controlled filter dropdown state
  const [filterSelections, setFilterSelections] = useState<Record<string, string>>({});

  // Use external pagination if provided, otherwise use internal
  const isControlledPagination = onPageChangeProp !== undefined;
  const page = isControlledPagination ? (pageProp ?? 1) : internalPage;
  const rowsPerPage = isControlledPagination ? (rowsPerPageProp ?? 50) : internalRowsPerPage;

  const onPageChange = useCallback((newPage: number) => {
    if (isControlledPagination && onPageChangeProp) {
      onPageChangeProp(newPage);
    } else {
      setInternalPage(newPage);
      // Sync AG Grid's internal pagination
      if (gridApi && !hidePagination) {
        gridApi.paginationGoToPage(newPage - 1);
      }
    }
  }, [isControlledPagination, onPageChangeProp, gridApi, hidePagination]);

  const onRowsPerPageChange = useCallback((rows: number) => {
    if (isControlledPagination && onRowsPerPageChangeProp) {
      onRowsPerPageChangeProp(rows);
    } else {
      setInternalRowsPerPage(rows);
      setInternalPage(1); // Reset to first page
      if (gridApi && !hidePagination) {
        gridApi.paginationSetPageSize(rows);
        gridApi.paginationGoToPage(0);
      }
    }
  }, [isControlledPagination, onRowsPerPageChangeProp, gridApi, hidePagination]);

  // Use rowData length as recordCount if not explicitly provided
  const recordCount = recordCountProp ?? rowData.length;

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    minWidth: 100,
    // 1.6: Always show column menu
    suppressHeaderMenuButton: false,
    suppressHeaderFilterButton: false,
  }), []);

  const enhancedColumnDefs = useMemo(() => {
    if (!rowData || rowData.length === 0) return columnDefs;
    
    // Sample first few rows to accurately determine type
    const sampleRows = rowData.slice(0, 5);
    
    const isNumeric = (value: any) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'number') return true;
      if (typeof value === 'string') {
        const withoutCommas = value.replace(/,/g, '');
        if (withoutCommas.trim() === '') return false;
        return !isNaN(Number(withoutCommas));
      }
      return false;
    };

    const processColumns = (cols: ColDef[]): ColDef[] => {
      return cols.map(col => {
        let newCol = { ...col };

        // Format header name: first letter capital, rest small
        if (newCol.headerName) {
          newCol.headerName = newCol.headerName.charAt(0).toUpperCase() + newCol.headerName.slice(1).toLowerCase();
        }

        if ((newCol as any).children) {
          return { ...newCol, children: processColumns((newCol as any).children as ColDef[]) };
        }
        
        if (newCol.type !== 'numericColumn' && newCol.field) {
          // Check if this field is numeric in all sampled rows (where it exists)
          let isNum = false;
          let hasVal = false;
          for (const row of sampleRows) {
            const val = row[newCol.field];
            if (val !== null && val !== undefined && val !== '') {
              hasVal = true;
              if (!isNumeric(val)) {
                isNum = false;
                break;
              } else {
                isNum = true;
              }
            }
          }
          
          // Exclusion based on typical string/code fields that might happen to be numeric
          const name = newCol.field.toLowerCase();
          const exclude = /(id|date|no|num|number|gstin|hsn|sac|code|phone|mobile)/.test(name);
          
          if (hasVal && isNum && !exclude) {
            return {
              ...newCol,
              type: 'numericColumn',
              cellClass: newCol.cellClass ? `${newCol.cellClass} force-right-align` : 'force-right-align',
              headerClass: newCol.headerClass ? `${newCol.headerClass} force-right-align` : 'force-right-align',
            };
          }
        }
        return newCol;
      });
    };
    
    return processColumns(columnDefs || []);
  }, [columnDefs, rowData]);

  const flatColumns = useMemo(() => {
    const flatten = (cols: any[]): any[] => {
      let flat: any[] = [];
      for (const col of cols) {
        if (col.children) {
          flat = flat.concat(flatten(col.children));
        } else {
          flat.push(col);
        }
      }
      return flat;
    };
    return flatten(columnDefs || []).filter(c => c.field);
  }, [columnDefs]);

  useEffect(() => {
    if (gridApi) {
      const model: any = {};
      Object.keys(filterModel).forEach(key => {
        if (filterModel[key]) {
          model[key] = { filterType: 'text', type: 'contains', filter: filterModel[key] };
        }
      });
      gridApi.setFilterModel(model);
      gridApi.onFilterChanged();
    }
  }, [filterModel, gridApi]);

  // 1.3: Escape key listener for fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen(false);
      }
    };
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll in fullscreen
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const totalPages = Math.max(1, Math.ceil(recordCount / rowsPerPage));
  const startRecord = recordCount > 0 ? (page - 1) * rowsPerPage + 1 : 0;
  const endRecord = Math.min(page * rowsPerPage, recordCount);

  const containerClass = variant === 'standalone' ? styles.container : styles.nestedContainer;

  // 1.8: Handle filter dropdown changes (controlled)
  const handleFilterDropdownChange = useCallback((filterName: string, value: string) => {
    setFilterSelections(prev => ({ ...prev, [filterName]: value }));
    if (onFilterChange) {
      onFilterChange(filterName, value);
    }
  }, [onFilterChange]);

  // Pagination page numbers logic
  const renderPageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i}
          className={`${styles.pageButton} ${page === i ? styles.active : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipses if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis" style={{ color: '#667085' }}>...</span>);
      }
      pages.push(
        <button 
          key={totalPages}
          className={`${styles.pageButton} ${page === totalPages ? styles.active : ''}`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  const [cw, setCw] = useState<string>('100%');
  const updateWidth = useCallback((params: GridReadyEvent | any) => {
    if (!autoWidth) return;
    requestAnimationFrame(() => {
      if (!params.api) return;
      const colState = params.api.getColumnState?.() ?? [];
      const total = colState
        .filter((c: any) => !c.hide)
        .reduce((sum: number, c: any) => sum + (c.width ?? 0), 0);
      if (total > 0) setCw(`${total + 2}px`);
    });
  }, [autoWidth]);

  // Determine final container class (including fullscreen)
  const finalContainerClass = `${containerClass} ${isFullscreen ? styles.fullscreenContainer : ''}`;

  // 1.7: Check if there are no records
  const hasNoRecords = !rowData || rowData.length === 0;

  const tableContent = (
    <div ref={containerRef} className={finalContainerClass} style={{ width: '100%' }}>
      {/* Header */}
      {!hideHeader && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              {title && <h2 className={styles.title}>{title}</h2>}
              <span className={styles.badge}>{recordCount} Records</span>
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          
          <div className={styles.headerRight}>
            {topRightDropdownOptions && (
              <select 
                className={styles.primarySelect}
                onChange={(e) => onTopRightDropdownChange?.(e.target.value)}
              >
                {topRightDropdownOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            
            <button className={styles.iconButton} onClick={onRefresh} title="Refresh">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.6 2.4V6.4H9.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.4 13.6V9.6H6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.6 6.4C12.4 4 10.4 2.4 8 2.4C4.8 2.4 2.4 4.8 2.4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.4 9.6C3.6 12 5.6 13.6 8 13.6C11.2 13.6 13.6 11.2 13.6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button className={styles.filterButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14.6667 2H1.33333L6.66667 8.30667V12.6667L9.33333 14V8.30667L14.6667 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filters
              {filterCount > 0 && <span className={styles.filterBadge}>{filterCount}</span>}
            </button>
            <button className={styles.exportButton} onClick={onExport}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.66699 6.66663L8.00033 9.99996L11.3337 6.66663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      )}

      {/* 1.7: Empty state — show "No Records" instead of grid when no data */}
      {hasNoRecords ? (
        <>
          {/* Still show filter bar even when empty, but dropdowns won't do anything */}
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 14h6M9 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.emptyStateText}>No Records</p>
            <p className={styles.emptyStateSubtext}>There are no records to display for this section.</p>
          </div>
        </>
      ) : (
        <>
          {/* Filter Bar */}
          {(!hideFilterBar && (!showFilterBarInFullscreenOnly || isFullscreen)) && (
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search invoice no., supplier, GSTIN, state..."
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                </div>
                
                {/* 1.8: Controlled filter dropdowns */}
                {filters.map(filter => (
                  <select 
                    key={filter.name}
                    className={styles.filterSelect}
                    value={filterSelections[filter.name] || ''}
                    onChange={(e) => handleFilterDropdownChange(filter.name, e.target.value)}
                  >
                    <option value="">{filter.name}</option>
                    {filter.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ))}
              </div>
              
              <div className={styles.filterGroup} style={{ flex: 'none', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <button className={styles.filterButton} onClick={() => { setShowFilterPopover(prev => !prev); setShowColumnPopover(false); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14.6667 2H1.33333L6.66667 8.30667V12.6667L9.33333 14V8.30667L14.6667 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Filters
                    {filterCount > 0 && <span className={styles.filterBadge}>{filterCount}</span>}
                  </button>
                  {showFilterPopover && (
                    <div className={styles.columnPopover} style={{ width: '240px' }}>
                      <div className={styles.columnPopoverTitle}>Filter Columns</div>
                      <div className={styles.columnPopoverList} style={{ maxHeight: '350px' }}>
                        {flatColumns.map(col => {
                          const field = (col as any).field;
                          const header = (col as any).headerName || field;
                          return (
                            <div key={field} style={{ padding: '8px' }}>
                              <div style={{ fontSize: '12px', marginBottom: '4px', color: '#344054', fontWeight: 500 }}>{header}</div>
                              <input 
                                type="text" 
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #eaecf0', fontSize: '12px', outline: 'none' }}
                                placeholder={`Contains...`}
                                value={filterModel[field] || ''}
                                onChange={(e) => setFilterModel(prev => ({ ...prev, [field]: e.target.value }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button className={styles.filterButton} onClick={() => { setShowColumnPopover(prev => !prev); setShowFilterPopover(false); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 14H10M2 2H14C14.5523 2 15 2.44772 15 3V13C15 13.5523 14.5523 14 14 14H2C1.44772 14 1 13.5523 1 13V3C1 2.44772 1.44772 2 2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.33331 2V14M10.6666 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Columns
                  </button>
                  {showColumnPopover && (
                    <div className={styles.columnPopover}>
                      <div className={styles.columnPopoverTitle}>Show/Hide Columns</div>
                      <div className={styles.columnPopoverList}>
                        {flatColumns.map(col => {
                          const field = (col as any).field;
                          const header = (col as any).headerName || field;
                          const isVisible = gridApi?.getColumn(field)?.isVisible() ?? true;
                          
                          return (
                            <label key={field} className={styles.columnPopoverItem}>
                              <input 
                                type="checkbox" 
                                defaultChecked={isVisible}
                                onChange={(e) => {
                                  gridApi?.setColumnsVisible([field], e.target.checked);
                                }}
                              />
                              {header}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen button — inside filter bar */}
                <button 
                  className={styles.fullscreenButton} 
                  onClick={() => handleToggleFullscreen(!isFullscreen)} 
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}


          {/* Grid */}
          <div className={styles.gridWrapper} style={{ width: autoWidth ? cw : '100%', position: 'relative' }}>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 280px)' : 'auto' }}>
              <AgGridReact
                theme="legacy"
                rowData={rowData}
                columnDefs={enhancedColumnDefs}
                defaultColDef={defaultColDef}
                headerHeight={48}
                groupHeaderHeight={48}
                floatingFiltersHeight={48}
                autoSizeStrategy={{
                  type: 'fitCellContents',
                  defaultMinWidth: 100,
                }}
                icons={{
                  menu: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
                  filter: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 2 15 2 9 8 9 14 7 14 7 8"></polygon></svg>'
                }}
                rowSelection="multiple"
                domLayout={!isFullscreen ? 'autoHeight' : 'normal'}
                suppressPaginationPanel={true}
                pagination={!hidePagination}
                paginationPageSize={rowsPerPage}
                pinnedBottomRowData={pinnedBottomRowData}
                onGridReady={(params: GridReadyEvent) => {
                  setGridApi(params.api);
                  if (page > 1 && !hidePagination) {
                    params.api.paginationGoToPage(page - 1);
                  }
                  updateWidth(params);
                }}
                onFirstDataRendered={(params: any) => {
                  if (params.api) {
                    const allColIds = params.api.getColumns()?.map((col: any) => col.getId()) || [];
                    params.api.autoSizeColumns(allColIds, false);
                  }
                  updateWidth(params);
                }}
                onColumnResized={updateWidth}
              />
            </div>
          </div>

          {/* 1.2: Status Bar */}
          <div className={styles.statusBar}>
            <div className={styles.statusBarLeft}>
              <span>
                {recordCount > 0 
                  ? `Showing ${startRecord}–${endRecord} of ${recordCount} records` 
                  : 'No records'}
              </span>
            </div>
            <div className={styles.statusBarRight}>
              <span>{flatColumns.length} columns</span>
              {(showFilterBarInFullscreenOnly && !hideFilterBar) && (
                <button
                  className={styles.statusBarFullscreenButton}
                  onClick={() => handleToggleFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          {!hidePagination && (
            <div className={styles.pagination}>
              <div className={styles.paginationLeft}>
                <div className={styles.rowsPerPage}>
                  Rows per page:
                  <select 
                    className={styles.rowsSelect}
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                <div className={styles.recordCount}>
                  {recordCount > 0 ? `${startRecord} - ${endRecord} of ${recordCount}` : '0 of 0'}
                </div>
              </div>
              
              <div className={styles.paginationControls}>
                <button 
                  className={styles.pageButton} 
                  disabled={page === 1}
                  onClick={() => onPageChange(1)}
                >
                  «
                </button>
                <button 
                  className={styles.pageButton} 
                  disabled={page === 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  ‹
                </button>
                
                {renderPageNumbers()}
                
                <button 
                  className={styles.pageButton} 
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => onPageChange(page + 1)}
                >
                  ›
                </button>
                <button 
                  className={styles.pageButton} 
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => onPageChange(totalPages)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // When fullscreen, render via portal at document.body to escape
  // any ancestor stacking contexts (transforms, will-change, etc.)
  // that would keep the sidebar visible.
  if (isFullscreen) {
    return ReactDOM.createPortal(tableContent, document.body);
  }

  return tableContent;
};

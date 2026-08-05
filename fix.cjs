const fs = require('fs');
let c = fs.readFileSync('src/styles/ag-grid-custom.css', 'utf-8');

const startIndex = c.indexOf('/* --- PREMIUM AG GRID ENTERPRISE MENU --- */');
if (startIndex !== -1) {
  c = c.substring(0, startIndex);
  
  const newCss = `/* --- PREMIUM AG GRID ENTERPRISE MENU --- */
.ag-theme-tax-jiffy .ag-menu,
.ag-theme-tax-jiffy-data .ag-menu,
.ag-theme-blue-headers .ag-menu {
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #eaecf0 !important;
  padding: 6px 0 !important;
  background: #ffffff !important;
  font-family: inherit !important;
  min-width: 200px;
}

.ag-theme-tax-jiffy .ag-menu-option,
.ag-theme-tax-jiffy-data .ag-menu-option,
.ag-theme-blue-headers .ag-menu-option {
  position: relative !important;
  padding: 8px 12px 8px 32px !important; /* 32px ensures text aligns consistently */
  transition: background-color 0.15s ease;
  font-size: 13px !important;
  color: #344054 !important;
  line-height: 20px !important;
}

.ag-theme-tax-jiffy .ag-menu-option:hover,
.ag-theme-tax-jiffy-data .ag-menu-option:hover,
.ag-theme-blue-headers .ag-menu-option:hover {
  background-color: #f9fafb !important;
  color: #2e5cff !important;
}

.ag-theme-tax-jiffy .ag-menu-option-icon,
.ag-theme-tax-jiffy-data .ag-menu-option-icon,
.ag-theme-blue-headers .ag-menu-option-icon {
  position: absolute !important;
  left: 10px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-right: 0 !important;
  width: 14px !important;
  height: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0.7;
}

.ag-theme-tax-jiffy .ag-menu-option:hover .ag-menu-option-icon,
.ag-theme-tax-jiffy-data .ag-menu-option:hover .ag-menu-option-icon,
.ag-theme-blue-headers .ag-menu-option:hover .ag-menu-option-icon {
  opacity: 1;
}

/* Hide ALL pseudo-element font glyphs inside menu items to completely remove broken squares */
.ag-menu-option-icon .ag-icon::before,
.ag-menu-option-popup-pointer .ag-icon::before {
  content: none !important;
}

/* Apply SVG masks directly to meaningful icons */
.ag-menu-option-icon .ag-icon-asc,
.ag-menu-option-icon .ag-icon-desc,
.ag-menu-option-icon .ag-icon-pin,
.ag-menu-option-icon .ag-icon-group,
.ag-menu-option-icon .ag-icon-columns,
.ag-menu-option-popup-pointer .ag-icon-small-right {
  display: block !important;
  width: 14px !important;
  height: 14px !important;
  background-color: currentColor !important;
}

/* Sub-menu chevron */
.ag-menu-option-popup-pointer {
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* Specific SVGs */
.ag-menu-option-icon .ag-icon-asc {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 19V5M5 12l7-7 7 7'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 19V5M5 12l7-7 7 7'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-menu-option-icon .ag-icon-desc {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 5v14M19 12l-7 7-7-7'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 5v14M19 12l-7 7-7-7'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-menu-option-icon .ag-icon-pin {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-menu-option-icon .ag-icon-group {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'/%3E%3Cpolyline points='2 17 12 22 22 17'/%3E%3Cpolyline points='2 12 12 17 22 12'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'/%3E%3Cpolyline points='2 17 12 22 22 17'/%3E%3Cpolyline points='2 12 12 17 22 12'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-menu-option-icon .ag-icon-columns {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='12' y1='3' x2='12' y2='21'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='12' y1='3' x2='12' y2='21'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-menu-option-popup-pointer .ag-icon-small-right {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-theme-tax-jiffy .ag-menu-separator,
.ag-theme-tax-jiffy-data .ag-menu-separator,
.ag-theme-blue-headers .ag-menu-separator {
  margin: 4px 0 !important;
  height: 1px !important;
  background-color: #f2f4f7 !important;
}
`;

  fs.writeFileSync('src/styles/ag-grid-custom.css', c + newCss);
}

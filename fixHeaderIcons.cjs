const fs = require('fs');
let c = fs.readFileSync('src/styles/ag-grid-custom.css', 'utf-8');

const additionalMasks = `
/* --- GLOBAL FIX FOR BROKEN FONT ICONS IN HEADERS AND FILTERS --- */
/* Completely disable the broken font glyphs */
.ag-theme-tax-jiffy .ag-icon-menu::before,
.ag-theme-tax-jiffy-data .ag-icon-menu::before,
.ag-theme-blue-headers .ag-icon-menu::before,
.ag-theme-tax-jiffy .ag-icon-filter::before,
.ag-theme-tax-jiffy-data .ag-icon-filter::before,
.ag-theme-blue-headers .ag-icon-filter::before,
.ag-theme-tax-jiffy .ag-icon-pin::before,
.ag-theme-tax-jiffy-data .ag-icon-pin::before,
.ag-theme-blue-headers .ag-icon-pin::before {
  content: none !important;
}

/* Apply SVG masks to the .ag-icon container itself */
.ag-icon-menu, .ag-icon-filter, .ag-icon-pin {
  display: inline-block !important;
  width: 14px !important;
  height: 14px !important;
  background-color: currentColor !important;
  font-size: 0 !important;
  color: inherit;
}

.ag-icon-menu {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-icon-filter {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ag-icon-pin {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/%3E%3C/svg%3E") no-repeat center / contain;
}
`;

fs.writeFileSync('src/styles/ag-grid-custom.css', c + '\n' + additionalMasks);

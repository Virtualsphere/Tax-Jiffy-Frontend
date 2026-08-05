const fs = require('fs');
let c = fs.readFileSync('src/styles/ag-grid-custom.css', 'utf-8');

const additionalMasks = `
/* --- FIX FOR MENU ALT ICON IN HEADERS --- */
.ag-theme-tax-jiffy .ag-icon-menu-alt::before,
.ag-theme-tax-jiffy-data .ag-icon-menu-alt::before,
.ag-theme-blue-headers .ag-icon-menu-alt::before {
  content: none !important;
}

.ag-icon-menu-alt {
  display: inline-block !important;
  width: 14px !important;
  height: 14px !important;
  background-color: currentColor !important;
  font-size: 0 !important;
  color: inherit;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
}

/* Also fix .ag-icon-aasc and .ag-icon-adesc just in case */
.ag-theme-tax-jiffy .ag-icon-aasc::before,
.ag-theme-tax-jiffy-data .ag-icon-aasc::before,
.ag-theme-blue-headers .ag-icon-aasc::before,
.ag-theme-tax-jiffy .ag-icon-adesc::before,
.ag-theme-tax-jiffy-data .ag-icon-adesc::before,
.ag-theme-blue-headers .ag-icon-adesc::before {
  content: none !important;
}
`;

fs.writeFileSync('src/styles/ag-grid-custom.css', c + '\n' + additionalMasks);

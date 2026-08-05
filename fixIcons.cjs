const fs = require('fs');
let c = fs.readFileSync('src/styles/ag-grid-custom.css', 'utf-8');

const targetStr = '.ag-icon-pin, .ag-icon-group, .ag-icon-columns {';
const newStr = '.ag-icon-pin, .ag-icon-group, .ag-icon-columns, .ag-icon-menu, .ag-icon-filter {';
c = c.replace(targetStr, newStr);

const targetStr2 = '.ag-icon-pin::before, .ag-icon-group::before, .ag-icon-columns::before {';
const newStr2 = '.ag-icon-pin::before, .ag-icon-group::before, .ag-icon-columns::before, .ag-icon-menu::before, .ag-icon-filter::before {';
c = c.replace(targetStr2, newStr2);

const additionalMasks = `
/* Menu (Hamburger) */
.ag-icon-menu::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E") no-repeat center / contain;
}

/* Filter (Funnel) */
.ag-icon-filter::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E") no-repeat center / contain;
}
`;

c = c.replace('/* --- PREMIUM AG GRID ENTERPRISE MENU --- */', additionalMasks + '\n/* --- PREMIUM AG GRID ENTERPRISE MENU --- */');

fs.writeFileSync('src/styles/ag-grid-custom.css', c);

const fs = require('fs');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Fix React import in EWayBillPage.tsx
    if (filePath.endsWith('EWayBillPage.tsx')) {
        content = content.replace("import React, { useState, useMemo }", "import { useState, useMemo }");
    }
    
    // Fix GSTR2BPage.tsx fontSize error
    if (filePath.endsWith('GSTR2BPage.tsx')) {
        content = content.replace("fontSize?: undefined;", "fontSize?: never;").replace("fontSize?: undefined;", "fontSize?: never;");
        content = content.replace(
          "return params.value < 0 ? { color: '#e53e3e', fontWeight: 600 } : params.value > 0 ? { color: '#38a169', fontWeight: 600 } : { fontSize: '14px' };",
          "return params.value < 0 ? { color: '#e53e3e', fontWeight: 600 } : params.value > 0 ? { color: '#38a169', fontWeight: 600 } : {};"
        );
    }

    if (content.includes('import { ColDef }')) {
        content = content.replace('import { ColDef }', 'import type { ColDef }');
        changed = true;
    }
    if (content.includes('import { ColDef, ColGroupDef }')) {
        content = content.replace('import { ColDef, ColGroupDef }', 'import type { ColDef, ColGroupDef }');
        changed = true;
    }
    if (content.includes('import { ColDef, ColGroupDef, RowClassParams }')) {
        content = content.replace('import { ColDef, ColGroupDef, RowClassParams }', 'import type { ColDef, ColGroupDef, RowClassParams }');
        changed = true;
    }

    if (changed || filePath.endsWith('GSTR2BPage.tsx') || filePath.endsWith('EWayBillPage.tsx')) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed', filePath);
    }
}

const files = [
    'src/pages/dashboard/eInvoice/EInvoicePage.tsx',
    'src/pages/dashboard/eWayBill/EWayBillPage.tsx',
    'src/pages/dashboard/gstr1/tabs/GSTR1AdvancedTab.tsx',
    'src/pages/dashboard/gstr1/tabs/GSTR1AmendmentsTab.tsx',
    'src/pages/dashboard/gstr1/tabs/GSTR1BasicTab.tsx',
    'src/pages/dashboard/gstr1/tabs/GSTR1OthersTab.tsx',
    'src/pages/dashboard/gstr1/tabs/GSTR1OutwardTab.tsx',
    'src/pages/dashboard/gstr2b/GSTR2BPage.tsx',
    'src/pages/dashboard/gstr3b/GSTR3BPage.tsx',
    'src/pages/pricing/components/PricingComparisonSection.tsx'
];

files.forEach(replaceInFile);

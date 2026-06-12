const fs = require('fs');

let content = fs.readFileSync('GSTR1Page.tsx', 'utf-8');

let startIndex = content.indexOf('          {activeTab === \'Basic\' && (');
let endIndex = content.indexOf('          )}\r\n        </div>\r\n      </div>\r\n\r\n      {/* Footer */}');

if (startIndex !== -1 && endIndex !== -1) {
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex);
    
    // add imports
    let importStr = `import { GSTR1BasicTab } from './tabs/GSTR1BasicTab';
import { GSTR1OutwardTab } from './tabs/GSTR1OutwardTab';
import { GSTR1AmendmentsTab } from './tabs/GSTR1AmendmentsTab';
import { GSTR1AdvancedTab } from './tabs/GSTR1AdvancedTab';
import { GSTR1OthersTab } from './tabs/GSTR1OthersTab';
`;
    before = before.replace("import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';", "import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';\n" + importStr);
    
    const newTabs = `          {activeTab === 'Basic' && <GSTR1BasicTab data={draft.data.rows} />}
          {activeTab === 'Outward' && draft.data.outwardData && <GSTR1OutwardTab data={draft.data.outwardData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
          {activeTab === 'Amendments' && draft.data.amendmentsData && <GSTR1AmendmentsTab data={draft.data.amendmentsData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
          {activeTab === 'Advanced' && draft.data.advancedData && <GSTR1AdvancedTab data={draft.data.advancedData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
          {activeTab === 'Others' && draft.data.othersData && <GSTR1OthersTab data={draft.data.othersData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
`;

    fs.writeFileSync('GSTR1Page.tsx', before + newTabs + after.substring(13), 'utf-8'); // Skip the "          )}\n" from after since we replaced it
    console.log("Success");
} else {
    console.log("Could not find boundaries");
    console.log("Start:", startIndex, "End:", endIndex);
}

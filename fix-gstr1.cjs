const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages', 'dashboard', 'gstr1', 'tabs');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf-8');
    let changed = false;

    if (content.includes(' domLayout="autoHeight"')) {
      content = content.replace(/ domLayout="autoHeight"/g, '');
      changed = true;
    }

    if (content.includes('ag-theme-tax-jiffy') && !content.includes('ag-theme-blue-group-headers')) {
      content = content.replace(/className="ag-theme-tax-jiffy"/g, 'className="ag-theme-tax-jiffy ag-theme-blue-group-headers"');
      changed = true;
    }

    if (content.includes("height: '300px'")) {
      content = content.replace(/height: '300px'/g, "height: '400px'");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed', file);
    }
  }
}

const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Add theme="legacy"
    if (content.includes('<AgGridReact') && !content.includes('theme="legacy"')) {
        content = content.replace(/<AgGridReact/g, '<AgGridReact theme="legacy"');
        changed = true;
    }

    // Change domLayout
    if (content.includes('domLayout="normal"')) {
        content = content.replace(/domLayout="normal"/g, 'domLayout="autoHeight"');
        changed = true;
    }
    if (content.includes("domLayout='normal'")) {
        content = content.replace(/domLayout='normal'/g, 'domLayout="autoHeight"');
        changed = true;
    }

    // Also if there's any domLayout missing or we want to just ensure autoHeight is there
    // but the above covers the ones we explicitly set to normal.

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src', 'pages'));
console.log('Done');

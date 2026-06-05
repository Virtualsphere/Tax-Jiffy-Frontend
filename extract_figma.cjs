const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/omen/.mcp-figma/cache/file_37Qlld03Kr64UbdZEML95v_1780664497281.json', 'utf8'));

// The document root
const root = data.document;

function findNode(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function extractText(node, results = []) {
  if (node.type === 'TEXT') {
    results.push({ name: node.name, text: node.characters });
  }
  if (node.children) {
    for (const child of node.children) {
      extractText(child, results);
    }
  }
  return results;
}

const targetIds = {
  '2:11913': 'Product Preview Detail',
  '2:11958': 'Reconciliation Section',
  '2:12033': 'Compliance Section',
  '2:12094': 'Intelligence Section',
  '2:12151': 'Time Saving Section',
  '2:12231': 'Section - Final CTA'
};

const output = {};

for (const [id, name] of Object.entries(targetIds)) {
  const node = findNode(root, id);
  if (node) {
    output[name] = extractText(node);
  } else {
    output[name] = "Node not found";
  }
}

console.log(JSON.stringify(output, null, 2));

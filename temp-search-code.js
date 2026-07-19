const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        searchDir(fullPath, query);
      }
    } else {
      // Skip binary-looking paths
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.ico') || file.endsWith('.woff') || file.endsWith('.woff2') || file.endsWith('.pdf')) {
        continue;
      }
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          console.log(`Found "${query}" in: ${fullPath}`);
        }
      } catch (e) {}
    }
  }
}

console.log('Searching for "entreprise"...');
searchDir('e:/cjdtc/cj-dtc-main', "entreprise");
console.log('Finished.');

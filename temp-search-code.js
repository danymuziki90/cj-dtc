const fs = require('fs');

const content = fs.readFileSync('e:/cjdtc/cj-dtc-main/app/[locale]/public/formations/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes("l'entreprise")) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});

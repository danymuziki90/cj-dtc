const fs = require('fs');
const path = require('path');

const files = [
  'e:/cjdtc/cj-dtc-main/app/admin/sessions/page.tsx',
  'e:/cjdtc/cj-dtc-main/app/admin/dashboard/page.tsx',
  'e:/cjdtc/cj-dtc-main/components/programmes/SessionRegistrationModal.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  console.log(`\n=== Matching lines in: ${file} ===`);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('entreprise')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

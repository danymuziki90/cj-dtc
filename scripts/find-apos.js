const fs = require('fs')
const path = require('path')

function walk(dir) {
  const files = []
  try {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git', '.tools'].includes(f.name)) continue
      const full = path.join(dir, f.name)
      if (f.isDirectory()) files.push(...walk(full))
      else if (/\.(tsx|ts|jsx|js)$/.test(f.name)) files.push(full)
    }
  } catch (e) {}
  return files
}

const root = path.join(__dirname, '..')
const dirs = [path.join(root, 'app'), path.join(root, 'components')]
const allFiles = dirs.flatMap(walk)

const errors = []
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    // Detect: single-quoted string containing an unescaped apostrophe
    // Pattern: 'something'something (apostrophe breaks the string)
    const matches = line.matchAll(/'([^'\\]*)'/g)
    // Simpler: look for ' followed by word char, then ' then word char (French apostrophe pattern)
    if (/"use client"|"use server"/.test(line)) return
    const m = line.match(/'[^'"\\`\n]*'[a-z\u00e0-\u00ff]/)
    if (m) {
      errors.push(`${file.replace(root + path.sep, '')}:${i + 1}`)
      errors.push(`  ${line.trim().slice(0, 150)}`)
      errors.push('')
    }
  })
}

if (errors.length === 0) {
  console.log('No apostrophe issues found.')
} else {
  console.log(`Found ${errors.length / 3} potential issue(s):\n`)
  console.log(errors.join('\n'))
}

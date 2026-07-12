/**
 * Syntax checker for TSX/TS files using Node's built-in acorn-like approach.
 * Detects the most common JSX/JS build-breaking patterns:
 *  1. Unescaped French apostrophes in single-quoted JSX strings
 *  2. Missing named exports from lucide-react (checks against installed version)
 *  3. Usage of undefined identifiers that are common mistakes (useRouter without import, etc.)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

// ── 1. Get all exported names from lucide-react ──────────────────────────────
const lucidePath = path.join(ROOT, 'node_modules/lucide-react/dist/esm/lucide-react.js')
const lucideExports = new Set()
if (fs.existsSync(lucidePath)) {
  const content = fs.readFileSync(lucidePath, 'utf8')
  for (const m of content.matchAll(/export \{ default as (\w+)/g)) {
    lucideExports.add(m[1])
  }
}
console.log(`Loaded ${lucideExports.size} lucide-react exports\n`)

// ── 2. Walk files ─────────────────────────────────────────────────────────────
function walk(dir) {
  const out = []
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git', '.tools', 'dist'].includes(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) out.push(...walk(full))
      else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full)
    }
  } catch (_) {}
  return out
}

const files = walk(path.join(ROOT, 'app')).concat(walk(path.join(ROOT, 'components')))
const errors = []

for (const file of files) {
  const rel = file.replace(ROOT + path.sep, '')
  const raw = fs.readFileSync(file, 'utf8')
  const lines = raw.split('\n')

  // ── A. Unescaped apostrophes in single-quoted JSX strings
  //   Pattern: 'text'text  (apostrophe breaks JS string inside JSX expression)
  //   We skip TypeScript union types: 'a' | 'b'
  //   We skip lines that are pure TS (interfaces, type aliases, switch cases)
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    // Skip pure TS lines unlikely to be JSX text
    if (/^(type|interface|case|const|let|var|\/\/|import|export|return\s*$|\*|\{|\}|\[|\])/.test(trimmed)) return
    // Skip template literals
    if (trimmed.includes('`')) return
    // Match: single-quoted string where the closing quote is followed immediately by a lowercase letter
    // e.g. 'aujourd'hui' — the first ' closes at "aujourd" then "hui" is unexpected
    const m = line.match(/'([^'\\]*)\'([a-z\u00e0-\u00ff])/)
    if (m) {
      // Make sure it's not a TypeScript union (followed by space | or ,)
      const after = line.slice(line.indexOf(m[0]) + m[0].length)
      if (/^\s*[|,)]/.test(after)) return
      errors.push({ file: rel, line: i + 1, type: 'APOSTROPHE', detail: trimmed.slice(0, 120) })
    }
  })

  // ── B. Lucide-react: imported names that don't exist
  const lucideImportMatch = raw.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/)
  if (lucideImportMatch) {
    const imported = lucideImportMatch[1]
      .split(',')
      .map(s => s.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean)
    for (const name of imported) {
      if (name && !lucideExports.has(name)) {
        const lineNum = raw.split('\n').findIndex(l => l.includes(name) && l.includes('lucide')) + 1 || 1
        errors.push({ file: rel, line: lineNum, type: 'LUCIDE_MISSING', detail: `'${name}' not found in lucide-react@installed` })
      }
    }
  }

  // ── C. useRouter() called but not imported
  if (/\buseRouter\(\)/.test(raw) && !/import[^;]+useRouter/.test(raw)) {
    const lineNum = raw.split('\n').findIndex(l => /\buseRouter\(\)/.test(l)) + 1
    errors.push({ file: rel, line: lineNum, type: 'MISSING_IMPORT', detail: 'useRouter() used but not imported from next/navigation' })
  }

  // ── D. Duplicate import of same symbol from same module
  const importLines = lines.filter(l => /^import\s/.test(l.trim()))
  const seen = new Map()
  for (const il of importLines) {
    const mod = (il.match(/from\s+['"]([^'"]+)['"]/) || [])[1]
    if (!mod) continue
    if (seen.has(mod)) {
      const lineNum = lines.findIndex(l => l === il) + 1
      errors.push({ file: rel, line: lineNum, type: 'DUPLICATE_IMPORT', detail: `Duplicate import from '${mod}'` })
    } else {
      seen.set(mod, true)
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (errors.length === 0) {
  console.log('✅  No issues found.')
} else {
  console.log(`❌  Found ${errors.length} issue(s):\n`)
  for (const e of errors) {
    console.log(`[${e.type}] ${e.file}:${e.line}`)
    console.log(`  ${e.detail}`)
    console.log()
  }
}

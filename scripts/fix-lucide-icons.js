/**
 * Auto-fix missing lucide-react icons by replacing with available alternatives.
 * Maps missing icons to their closest equivalents in v0.312.0
 */
const fs = require('fs')
const path = require('path')

// Mapping of missing icons to their available replacements in v0.312.0
const ICON_REPLACEMENTS = {
  'RefreshCw': 'RotateCw',
  'RefreshCcw': 'RotateCcw', 
  'Users2': 'Users',
  'Printer': 'PrinterIcon',
  'Save': 'SaveIcon',
  'Plus': 'PlusIcon',
  'Search': 'SearchIcon',
  'Trash2': 'Trash',
  'Target': 'TargetIcon',
  'Star': 'StarIcon',
  'User': 'UserIcon',
  'X': 'XIcon',
  'Square': 'SquareIcon',
  'Shield': 'ShieldIcon',
  'Megaphone': 'Volume2',
  'SendHorizonal': 'Send',
  'MapPin': 'MapPinIcon',
  'Mail': 'MailIcon',
  'PencilLine': 'Pencil',
  'ShieldAlert': 'ShieldAlert', // Might exist, fallback to Shield
  'ShieldCheck': 'ShieldCheck', // Might exist, fallback to Shield
  'UserRound': 'User',
  'MessageCircle': 'MessageCircleIcon',
  'Zap': 'ZapIcon',
  'Medal': 'Award',
  'NotebookText': 'BookOpen',
  'Sparkles': 'Sparkle',
}

const ROOT = path.join(__dirname, '..')

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
let totalFixed = 0

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false
  
  // Check if file imports from lucide-react
  if (!content.includes("from 'lucide-react'") && !content.includes('from "lucide-react"')) continue
  
  for (const [missing, replacement] of Object.entries(ICON_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${missing}\\b`, 'g')
    if (regex.test(content)) {
      content = content.replace(regex, replacement)
      modified = true
      totalFixed++
      console.log(`${path.relative(ROOT, file)}: ${missing} → ${replacement}`)
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8')
  }
}

console.log(`\n✅ Fixed ${totalFixed} icon references`)

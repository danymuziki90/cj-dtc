const fs = require('fs')
const path = require('path')

// All files changed in the "Entreprises" commit
const files = [
  'app/[locale]/espace-etudiants/confirm-inscription/page.tsx',
  'app/[locale]/espace-etudiants/mes-formations/page.tsx',
  'app/[locale]/espace-etudiants/mon-compte/page.tsx',
  'app/[locale]/formations/[slug]/page.tsx',
  'app/[locale]/formations/[slug]/layout.tsx',
  'app/[locale]/formations/inscription/page.tsx',
  'app/[locale]/formations/layout.tsx',
  'app/[locale]/formations/page.tsx',
  'app/[locale]/page.tsx',
  'app/[locale]/programmes/page.tsx',
  'app/[locale]/public/formations/page.tsx',
  'app/[locale]/public/page.tsx',
  'app/[locale]/contact/page.tsx',
  'app/admin/enrollments/page.tsx',
  'app/admin/formations/[id]/edit/page.tsx',
  'app/admin/formations/new/page.tsx',
  'app/admin/formations/page.tsx',
  'app/student/layout.tsx',
  'app/student/mes-sessions/page.tsx',
  'app/student/profile/page.tsx',
  'app/student/certificats/page.tsx',
]

const root = 'e:/cjdtc/cj-dtc-main'

for (const rel of files) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) { console.log('MISSING FILE:', rel); continue }
  const content = fs.readFileSync(full, 'utf8')
  
  // Check useRouter usage vs import
  const usesRouter = /\buseRouter\(\)/.test(content)
  const importsRouter = /import[^;]+useRouter[^;]+from\s+['"]next\/navigation['"]/.test(content)
  if (usesRouter && !importsRouter) console.log('MISSING useRouter import:', rel)

  // Check usePathname  
  const usesPathname = /\busePathname\(\)/.test(content)
  const importsPathname = /import[^;]+usePathname[^;]+from/.test(content)
  if (usesPathname && !importsPathname) console.log('MISSING usePathname import:', rel)

  // Check useSearchParams
  const usesSearchParams = /\buseSearchParams\(\)/.test(content)
  const importsSearchParams = /import[^;]+useSearchParams[^;]+from/.test(content)
  if (usesSearchParams && !importsSearchParams) console.log('MISSING useSearchParams import:', rel)
}

console.log('Check complete.')

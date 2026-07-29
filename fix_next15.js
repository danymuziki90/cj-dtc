const fs = require('fs')
const path = require('path')

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file))
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file)
    }
  })
  return results
}

const files = walk('./app')

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let changed = false
  
  // Replace `{ params }: { params: { ... } }` with `{ params }: { params: Promise<{ ... }> }`
  content = content.replace(/{\s*params\s*}\s*:\s*{\s*params\s*:\s*{([^}]+)}\s*}/g, (match, innerProps) => {
    changed = true
    return `{ params }: { params: Promise<{${innerProps}}> }`
  })

  if (changed) {
    // Basic replacement for accessing params fields
    // This is safe for simple access like params.id or params.subId
    content = content.replace(/params\.([a-zA-Z0-9_]+)/g, '(await params).$1')
    fs.writeFileSync(file, content, 'utf8')
    console.log(`Updated ${file}`)
  }
})

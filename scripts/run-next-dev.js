const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')

function isSupportedNodeVersion(version) {
  const [major, minor] = version.split('.').map(Number)
  return (major === 20 && minor >= 9) || major === 22
}

function findLocalNode22() {
  const toolsDir = path.join(process.cwd(), '.tools')
  if (!fs.existsSync(toolsDir)) return null

  const isWin = process.platform === 'win32'
  const entries = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^node-v22\..*-win-x64$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse()

  for (const dirName of entries) {
    const nodePath = isWin
      ? path.join(toolsDir, dirName, 'node.exe')
      : path.join(toolsDir, dirName, 'bin', 'node')
    if (fs.existsSync(nodePath)) return nodePath
  }

  return null
}

function runWithNode(nodeExecPath) {
  const nextCliPath = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!fs.existsSync(nextCliPath)) {
    console.error('Missing Next.js CLI at node_modules/next/dist/bin/next. Run npm install first.')
    process.exit(1)
  }

  const nodeDir = path.dirname(nodeExecPath)
  const env = {
    ...process.env,
    PATH: `${nodeDir}${path.delimiter}${process.env.PATH || ''}`,
  }

  const child = spawn(nodeExecPath, [nextCliPath, 'dev', '--webpack'], {
    stdio: 'inherit',
    env,
  })

  child.on('exit', (code) => process.exit(code ?? 1))
  child.on('error', (error) => {
    console.error(`Failed to start Next dev server: ${error.message}`)
    process.exit(1)
  })
}

const currentNodeVersion = process.versions.node

if (isSupportedNodeVersion(currentNodeVersion)) {
  runWithNode(process.execPath)
} else {
  const localNode22 = findLocalNode22()
  if (!localNode22) {
    console.error(
      [
        '',
        `Unsupported global Node.js version: v${currentNodeVersion}`,
        'This project needs Node.js 20.9+ (20.x) or 22.x LTS.',
        'No local Node 22 runtime was found in .tools/.',
        'Fix options:',
        '  1) nvm install 22 && nvm use 22',
        '  2) or add portable Node 22 to .tools/node-v22.x-win-x64/',
        '',
      ].join('\n')
    )
    process.exit(1)
  }

  console.warn(`Global Node v${currentNodeVersion} unsupported, using local runtime: ${localNode22}`)
  runWithNode(localNode22)
}

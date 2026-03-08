const [major, minor] = process.versions.node.split('.').map(Number)

const isSupported =
  (major === 20 && minor >= 9) ||
  major === 22

if (!isSupported) {
  console.error(
    [
      '',
      `Unsupported Node.js version: ${process.version}`,
      'This project requires Node.js 20.9+ (20.x) or 22.x LTS.',
      'Recommended fix:',
      '  1) nvm install 22',
      '  2) nvm use 22',
      '  3) npm install',
      '',
    ].join('\n')
  )
  process.exit(1)
}

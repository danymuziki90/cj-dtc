const { spawn } = require('child_process')
const path = require('path')

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next')
const existingNodeOptions = process.env.NODE_OPTIONS || ''
const memoryOption = '--max-old-space-size=8192'

const child = spawn(process.execPath, [memoryOption, nextBin, 'build'], {
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    NODE_OPTIONS: existingNodeOptions,
  },
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code || 0)
})

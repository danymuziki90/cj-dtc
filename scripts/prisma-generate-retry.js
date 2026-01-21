const { spawn } = require('child_process')

const maxRetries = 3
let attempt = 1

function run() {
    console.log(`Running prisma generate (attempt ${attempt}/${maxRetries})`)
    const child = spawn('npx', ['prisma', 'generate'], { stdio: 'inherit', shell: true })

    child.on('exit', (code) => {
        if (code === 0) {
            console.log('prisma generate succeeded')
            process.exit(0)
        }
        if (attempt < maxRetries) {
            attempt++
            console.log('Retrying prisma generate in 1s...')
            setTimeout(run, 1000)
        } else {
            console.error('prisma generate failed after retries')
            process.exit(code || 1)
        }
    })

    child.on('error', (err) => {
        console.error('Failed to start prisma generate:', err)
        process.exit(1)
    })
}

run()

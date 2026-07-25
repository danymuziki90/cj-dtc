
async function verifyMiddleware() {
    console.log('Testing Middleware Redirects...')

    try {
        // 1. Test Protected Route without Cookie
        const res = await fetch('http://localhost:3000/student/dashboard', {
            redirect: 'manual'
        })

        console.log(`GET /student/dashboard status: ${res.status}`)
        const location = res.headers.get('location')
        console.log(`Location header: ${location}`) 

        if (res.status === 307 || res.status === 308 || res.status === 302) {
            if (location && location.includes('/auth/login')) {
                console.log('✅ Middleware correctly redirects unauthenticated user.')
            } else if (location && location.includes('/fr/student/dashboard')) {
                console.log('ℹ️  Middleware redirected to locale. Following...')
                // Follow redirect manually one step
                const res2 = await fetch(new URL(location, 'http://localhost:3000'), { redirect: 'manual' })
                console.log(`GET ${location} status: ${res2.status}`)
                console.log(`Location: ${res2.headers.get('location')}`)
            } else {
                console.log('⚠️  Unexpected redirect location.')
            }
        } else {
            console.log('❌ Middleware DID NOT redirect. Status:', res.status)
        }

    } catch (e) {
        console.error('Fetch error:', e)
    }
}

verifyMiddleware()

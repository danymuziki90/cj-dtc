
async function login() {
    const email = 'test-1769200516620@example.com' // Use valid email from previous registration
    console.log(`Logging in with email: ${email}`)

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'password123'
            })
        })

        const data = await res.json()
        console.log('Status:', res.status)
        const setCookie = res.headers.get('set-cookie')
        console.log('Set-Cookie:', setCookie ? 'PRESENT' : 'MISSING')
        console.log('Response:', JSON.stringify(data, null, 2))

    } catch (error) {
        console.error('Fetch error:', error)
    }
}

login()

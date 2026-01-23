
async function testForgotPassword() {
    const email = 'test-1769200516620@example.com' // Use existing email
    console.log(`Requesting password reset for: ${email}`)

    try {
        const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })

        const data = await res.json()
        console.log('Status:', res.status)
        console.log('Response:', JSON.stringify(data, null, 2))

    } catch (error) {
        console.error('Fetch error:', error)
    }
}

testForgotPassword()

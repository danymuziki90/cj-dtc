
async function register() {
    const email = `test-${Date.now()}@example.com`
    console.log(`Registering user with email: ${email}`)

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Jean',
                lastName: 'Test',
                email,
                phone: '0812345678',
                password: 'password123',
                role: 'STUDENT'
            })
        })

        const data = await res.json()
        console.log('Status:', res.status)
        console.log('Response:', JSON.stringify(data, null, 2))

        if (res.ok) {
            console.log('Registration SUCCESS')
        } else {
            console.log('Registration FAILED')
        }

    } catch (error) {
        console.error('Fetch error:', error)
    }
}

register()

const urls = [
    { path: '/', check: /Depuis 2018/ },
    { path: '/fr', check: /Centre Panafricain/ },
    { path: '/admin', check: /Sign in|Connexion|Se connecter/ },
    { path: '/api/auth/signin', check: /Sign in|Connexion|Se connecter/ }
]

async function run() {
    for (const u of urls) {
        const full = `http://localhost:3000${u.path}`
        try {
            const res = await fetch(full)
            const text = await res.text()
            const ok = u.check.test(text)
            console.log(`${u.path} -> ${res.status} ${ok ? 'FOUND' : 'MISSING'}`)
        } catch (e) {
            console.error(`${u.path} -> ERROR`, e.message)
        }
    }
}

run().catch(e => { console.error(e); process.exit(1) })

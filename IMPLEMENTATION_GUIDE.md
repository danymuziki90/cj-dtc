# Guide d'Implémentation - Protection des Routes Étudiantes

## Sommaire

1. [Architecture Générale](#architecture-générale)
2. [Comment Ça Fonctionne](#comment-ça-fonctionne)
3. [Intégration pour les Développeurs](#intégration-pour-les-développeurs)
4. [Exemples Pratiques](#exemples-pratiques)
5. [Troubleshooting](#troubleshooting)

## Architecture Générale

```
Requête utilisateur
        ↓
   Middleware
        ↓
   Vérification d'authentification
        ↓
   Redirection si nécessaire (vers /login?callbackUrl=...)
        ↓
   Accès à la route (si authentifié)
        ↓
   Layout Student
        ↓
   Vérification supplémentaire
        ↓
   Affichage du contenu
```

## Comment Ça Fonctionne

### 1. Le Middleware

**Fichier**: `middleware.ts`

```typescript
// Intercepte les requêtes vers:
- /student/*
- /:locale/student/*

// Actions:
1. Vérifie que token existe
2. Redirige vers /auth/login?callbackUrl=... si pas de token
3. Valide le rôle (doit être 'STUDENT')
4. Rejette les autres rôles vers /auth/error
```

### 2. Le Layout Student

**Fichier**: `app/[locale]/student/layout.tsx`

```typescript
// Actions:
1. Utilise useSession() de next-auth
2. Écoute les changements de status
3. Redirige vers login si 'unauthenticated'
4. Passe le callbackUrl pour revenir à la page initiale
5. Affiche la navigation et le contenu
```

### 3. NextAuth Callbacks

**Fichier**: `lib/auth.ts`

```typescript
// Callbacks impliqués:
- session(): Injecte role et studentId dans la session
- jwt(): Injecte role et studentId dans le JWT
- redirect(): Gère les redirections intelligentes post-login
```

## Intégration pour les Développeurs

### Niveau 1: Protection Automatique (Recommandé)

Les routes sous `/app/[locale]/student/**` sont automatiquement protégées par le middleware.

**Vous n'avez rien à faire**, la protection est automatique !

```typescript
// ✅ Automatiquement protégée
/student/dashboard
/student/inscriptions
/student/profile
```

### Niveau 2: Protection au Niveau du Composant

Pour les pages qui ont besoin de vérifications supplémentaires:

```typescript
'use client'

import { useStudentAuth } from '@/hooks/useStudentAuth'

export default function MyPage() {
  const { session, isLoading, isAuthenticated } = useStudentAuth({
    requiredRole: 'STUDENT'
  })

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return null

  return <YourContent user={session?.user} />
}
```

### Niveau 3: Protection au Niveau du Composant Client

Pour protéger des sections spécifiques de l'UI:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Page() {
  return (
    <div>
      <PublicContent />
      
      <ProtectedRoute requiredRole="STUDENT">
        <AdminPanel /> {/* Seulement visible si authentifié */}
      </ProtectedRoute>
    </div>
  )
}
```

## Exemples Pratiques

### Exemple 1: Créer une Nouvelle Page d'Étudiant

```typescript
// app/[locale]/student/mes-ressources/page.tsx

'use client'

import { useStudentAuth } from '@/hooks/useStudentAuth'

export default function MyResourcesPage() {
  const { session, isLoading } = useStudentAuth()

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <h1>Mes ressources</h1>
      <p>Bienvenue {session?.user?.name}</p>
      {/* Contenu... */}
    </div>
  )
}
```

### Exemple 2: Page avec Données Personnalisées

```typescript
'use client'

import { useStudentAuth } from '@/hooks/useStudentAuth'
import { useEffect, useState } from 'react'

export default function StudentGradesPage() {
  const { session, isAuthenticated } = useStudentAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    // Récupérer les notes de l'étudiant
    const fetchGrades = async () => {
      try {
        const response = await fetch(
          `/api/student/${(session?.user as any)?.studentId}/grades`
        )
        const data = await response.json()
        setGrades(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [isAuthenticated, session?.user])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1>Mes Notes</h1>
      {grades.map(grade => (
        <div key={grade.id}>{grade.subject}: {grade.score}/20</div>
      ))}
    </div>
  )
}
```

### Exemple 3: Composant Protégé dans une Page Publique

```typescript
// app/[locale]/formations/page.tsx (page publique)

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function FormationsPage() {
  return (
    <div>
      <h1>Nos formations</h1>

      {/* Visible par tous */}
      <FormationsList />

      {/* Visible seulement par les étudiants connectés */}
      <ProtectedRoute>
        <div>
          <h2>Mes formations</h2>
          <MyEnrolledFormations />
        </div>
      </ProtectedRoute>
    </div>
  )
}
```

## Troubleshooting

### Problème: L'utilisateur reste sur la page de login

**Causes possibles:**
1. `NEXTAUTH_SECRET` non configuré
2. `NEXTAUTH_URL` incorrect en production
3. Le rôle n'est pas correctement sauvegardé

**Solution:**
```bash
# Vérifier .env.local
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Problème: Redirection infinie

**Causes possibles:**
1. La page de login est elle-même protégée
2. Le middleware appliqué à trop de routes

**Solution:**
```typescript
// middleware.ts - vérifier que les routes d'auth ne sont pas protégées
export const config = {
  matcher: [
    '/student/:path*',
    '/:locale/student/:path*',
    // IMPORTANT: N'inclure PAS /auth
  ],
}
```

### Problème: Session non actualisée après login

**Solution:**
```typescript
import { useSession } from 'next-auth/react'

// Utiliser update() après une modification
const { data: session, update } = useSession()

const handleUpdate = async () => {
  await update() // Actualise la session
}
```

### Problème: Rôle non présent dans la session

**Vérifier:**
1. Que le User/Student a un rôle dans la base de données
2. Que le callback `jwt()` injecte le rôle
3. Que le callback `session()` utilise le rôle du token

## Checklist de Déploiement

- [ ] `NEXTAUTH_SECRET` configuré en production
- [ ] `NEXTAUTH_URL` pointe vers le bon domaine
- [ ] Les providers OAuth sont configurés (Google, etc.)
- [ ] Les routes d'API d'authentification sont accessibles
- [ ] Le middleware est activé (`middleware.ts` présent)
- [ ] Les tests de redirection passent
- [ ] Les redirections post-login redirigent vers la bonne page

## Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Session & JWT Configuration](https://next-auth.js.org/configuration/callbacks)

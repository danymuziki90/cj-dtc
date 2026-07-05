# Protection des Routes Étudiantes - Documentation

## Vue d'ensemble

Ce système assure que toutes les routes `/student` sont accessibles uniquement aux utilisateurs authentifiés. Il offre une expérience utilisateur fluide avec des redirections intelligentes et une sécurité renforcée.

## Architecture

### 1. Middleware (`middleware.ts`)

Le middleware intercepte toutes les requêtes vers les routes protégées:

```typescript
// Protection automatique pour:
- /student/*
- /:locale/student/*
```

**Comportement:**
- Vérifie que l'utilisateur est authentifié
- Redirige les utilisateurs non authentifiés vers `/auth/login?callbackUrl=<page-demandée>`
- Valide que l'utilisateur a le rôle `STUDENT`
- Rejette les autres rôles vers une page d'erreur

### 2. Layout Étudiant (`app/[locale]/student/layout.tsx`)

Le layout gère:
- La vérification initiale de l'authentification
- Le chargement et les états de session
- La redirection avec le `callbackUrl` pour revenir à la page demandée
- L'interface de navigation principale

### 3. NextAuth Callbacks (`lib/auth.ts`)

Les callbacks améliorés gèrent:
- La gestion des sessions JWT
- Les redirections intelligentes post-connexion
- La sauvegarde du rôle et de l'ID étudiant

### 4. Composants et Hooks

#### Hook `useStudentAuth` (`hooks/useStudentAuth.ts`)

Pour protéger les pages/composants individuels:

```typescript
import { useStudentAuth, usePostLoginRedirect } from '@/hooks/useStudentAuth'

export default function MyStudentPage() {
  const { session, isLoading, isAuthenticated } = useStudentAuth()
  const { redirectAfterLogin } = usePostLoginRedirect()

  if (isLoading) return <LoadingSpinner />
  
  if (!isAuthenticated) return null

  return <YourComponent />
}
```

#### Composant `ProtectedRoute` (`components/ProtectedRoute.tsx`)

Pour protéger des sections de l'UI:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Page() {
  return (
    <ProtectedRoute requiredRole="STUDENT">
      <SectionConfidentielle />
    </ProtectedRoute>
  )
}
```

### 5. Page d'Erreur (`app/[locale]/auth/error/page.tsx`)

Affiche les erreurs d'authentification avec messages localisés:
- Accès non autorisé
- Compte invalide
- Session expirée
- Erreurs de connexion

### 6. Page de Connexion (`app/[locale]/auth/login/page.tsx`)

**Fonctionnalités:**
- Formulaire sécurisé avec validation
- Lien "Créer un compte" visible
- Gestion du `callbackUrl` pour revenir à la page demandée
- Gestion des erreurs NextAuth
- Option de connexion Google

## Flux de Redirection

```
Utilisateur accède à /student/dashboard
↓
Middleware intercepte la requête
↓
Utilisateur authentifié? NON
↓
Rediriger vers /auth/login?callbackUrl=/student/dashboard
↓
Utilisateur se connecte
↓
NextAuth redirige vers le callbackUrl (/student/dashboard)
↓
Utilisateur voit le contenu protégé
```

## États de Session NextAuth

L'application gère 3 états:

1. **loading** - Chargement de la session
   - Affiche un spinner
   - Aucune action utilisateur possible

2. **authenticated** - Utilisateur connecté
   - Affiche le contenu protégé
   - Navigation disponible

3. **unauthenticated** - Utilisateur non connecté
   - Redirection vers login
   - Affichage de la callbackUrl

## Utilisation pour les Développeurs

### Protéger une nouvelle route étudiant

1. Créer la route sous `/app/[locale]/student/...`
2. Le middleware la protège automatiquement
3. Optionnellement utiliser le hook:

```typescript
'use client'

import { useStudentAuth } from '@/hooks/useStudentAuth'

export default function MyPage() {
  const { session, isLoading } = useStudentAuth()

  if (isLoading) return <Skeleton />

  return <Content user={session?.user} />
}
```

### Protéger un composant spécifique

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<ProtectedRoute requiredRole="STUDENT">
  <MyComponent />
</ProtectedRoute>
```

## Gestion des Rôles

Le système supporte plusieurs rôles:

- **STUDENT** - Accès à `/student/*`
- **ADMIN** - Accès à `/admin/*` (à implémenter)
- **GUEST** - Accès public uniquement

## Variables d'Environnement Requises

```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Sécurité

### Bonnes pratiques implémentées

✅ Vérification d'authentification au niveau du middleware
✅ Validation du rôle d'utilisateur
✅ JWT sécurisés avec durée de vie limitée
✅ Protection contre les accès non autorisés
✅ Messages d'erreur clairs et localisés
✅ Redirections sécurisées post-connexion

### Points importants

- Le `callbackUrl` est validé avant redirection
- Les routes admin ne sont pas accessibles aux étudiants
- Les sessions expirent après 30 jours
- La vérification d'authentification se fait à plusieurs niveaux

## Débogage

Utiliser le composant `AuthDebugInfo` pour voir l'état actuel:

```typescript
import { AuthDebugInfo } from '@/components/ProtectedRoute'

export default function DebugPage() {
  return (
    <div>
      <AuthDebugInfo />
      {/* Votre contenu */}
    </div>
  )
}
```

## Améliorations Futures

- [ ] Implémenter la protection des routes admin
- [ ] Ajouter une vérification des permissions granulaires
- [ ] Implémenter le refresh automatique de la session
- [ ] Ajouter la vérification du 2FA
- [ ] Implémenter le logout automatique après inactivité

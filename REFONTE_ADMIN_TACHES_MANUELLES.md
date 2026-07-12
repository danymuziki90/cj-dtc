# Tâches manuelles restantes - Refonte Admin CJ DTC

## Contexte
Certains fichiers ont systématiquement rejeté les modifications automatiques. Ce document liste les modifications à effectuer manuellement pour compléter la refonte.

---

## ❌ FICHIERS BLOQUÉS (modifications à faire manuellement)

### 1. `components/EnrollmentPreviewModal.tsx`
**Problème :** Toutes les tentatives de modification ont été rejetées

**Modifications requises :**
- **Supprimer le badge paymentStatus** du header modal (ligne ~45-60)
  - Actuellement : affiche un badge avec le statut de paiement
  - Attendu : pas de badge paiement

- **Supprimer le bloc "Vérification paiement"** (ligne ~180-220)
  - Section entière avec inputs `paymentMethod`, `paymentReference`, `transactionId`
  - Bouton "Confirmer paiement"
  - Cette fonctionnalité retourne maintenant HTTP 410 côté API

- **Supprimer le bloc "Transactions"** (ligne ~250-300)
  - Tableau listant l'historique des paiements
  - Note : les données `Payment` restent en base pour historique, mais ne doivent plus être affichées dans l'admin

- **Supprimer la fonction `handleConfirmPayment`** (ligne ~80-120)
  - Cette fonction appelle l'action qui retourne maintenant HTTP 410

- **Nettoyer les variables d'état** :
  ```typescript
  // À supprimer :
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [transactionId, setTransactionId] = useState('')
  ```

**Impact utilisateur actuel :**
- Le modal affiche encore deux blocs paiement non-fonctionnels
- Le bouton "Confirmer paiement" appelle une API qui retourne HTTP 410
- Confusion pour l'admin

---

### 2. `app/admin/students/page.tsx`
**Problème :** Modifications KPI acceptées, mais colonne tableau et dossier 360 rejetées

**Modifications acceptées ✅ :**
- KPI "Paiements à suivre" et "Encaisse visible" retirés des métriques

**Modifications à faire manuellement :**

#### A. Colonne "Paiement" dans le tableau desktop (ligne ~350-380)
```tsx
// Actuellement :
<th>Paiement</th>
...
<td>{student.paymentStatus}</td>

// Attendu : supprimer cette colonne entièrement
```

#### B. Bloc "Paiements" dans le dossier 360 (StudentDetailSheet, ligne ~500-550)
```tsx
// Section entière à supprimer :
<section>
  <h3>Paiements</h3>
  <div>Total dû: {student.totalAmount}</div>
  <div>Payé: {student.paidAmount}</div>
  <div>Reste: {student.balance}</div>
</section>
```

**Impact utilisateur actuel :**
- Colonne "Paiement" affichée dans le tableau (valeurs vides ou obsolètes)
- Bloc "Paiements" affiché dans le dossier 360 d'un étudiant

---

### 3. `app/admin/enrollments/page.tsx`
**Problème :** Modifications du filtre `paymentStatus` rejetées

**Modifications requises :**
- **Retirer `paymentStatus` de `initialFilters`** (ligne ~35)
  ```typescript
  // Actuellement :
  const initialFilters = {
    status: '',
    formationId: '',
    paymentStatus: '',  // ← à supprimer
    accountStatus: '',
    startDateFrom: '',
    startDateTo: '',
    search: '',
  }
  ```

- **Retirer le passage de `paymentStatus` dans les params** (ligne ~110)
  ```typescript
  // À supprimer :
  if (nextFilters.paymentStatus) params.append('paymentStatus', nextFilters.paymentStatus)
  ```

**Note :** Le composant `EnrollmentFilters` a déjà été nettoyé et ne propose plus le filtre paiement, mais la page parente garde encore la référence dans son état local.

---

### 4. `lib/admin/reporting.ts`
**Problème :** Toutes les modifications rejetées (2 tentatives)

**Modifications requises :**
- **Supprimer `paymentsToValidate` du payload** (ligne ~60-80)
  ```typescript
  // À supprimer :
  const paymentsToValidate = await prisma.payment.count({
    where: { status: 'pending' }
  })
  ```

- **Supprimer `revenue` du payload** (ligne ~90-120)
  ```typescript
  // À supprimer :
  const revenue = {
    totalAmount: await prisma.payment.aggregate({...}),
    paidAmount: await prisma.payment.aggregate({...}),
    trend: calculateTrend(...)
  }
  ```

- **Supprimer `paymentConversionRate`** (ligne ~130-150)
  ```typescript
  // À supprimer :
  const paymentConversionRate = (paidEnrollments / totalEnrollments) * 100
  ```

- **Nettoyer le retour de `buildDashboardPayload`** :
  ```typescript
  // Retirer ces champs :
  return {
    // ... autres champs ...
    // paymentsToValidate,  ← supprimer
    // revenue,             ← supprimer
    // paymentConversionRate,  ← supprimer
  }
  ```

**Impact utilisateur actuel :**
- Le dashboard backend calcule encore ces métriques (temps de traitement inutile)
- Les données sont dans le payload mais ne sont **pas affichées** dans l'UI du dashboard (nettoyage déjà fait)

---

### 5. `app/admin/dashboard/page.tsx`
**Modifications requises :**
- **Nettoyer le type `DashboardPayload`** (ligne ~15-30)
  ```typescript
  type DashboardPayload = {
    // ... autres champs ...
    // revenue: { ... }  ← supprimer
    // paymentConversionRate: number  ← supprimer
  }
  ```

**Note :** L'UI n'affiche déjà plus ces KPI, mais le type TypeScript les référence encore.

---

## ✅ FICHIERS DÉJÀ NETTOYÉS (commités)

### Commit `58c1cd8` (P1 + P2 partiel)
- ✅ `components/admin-portal/AdminWorkspace.tsx` : Navigation "Inscriptions" → "Suivi et consultation"
- ✅ `app/admin/dashboard/page.tsx` : KPI paiement retirés du JSX
- ✅ `app/admin/payments/page.tsx` : redirect vers dashboard
- ✅ `app/api/enrollments/route.ts` : auto-activation, provisioning immédiat
- ✅ `app/api/enrollments/[id]/route.ts` : action `confirmPayment` → HTTP 410
- ✅ `app/api/enrollments/notify/route.ts` : emails `accepted`/`rejected`/`payment_reminder` supprimés
- ✅ `lib/student/account-provisioning.ts` : gate `awaiting_payment` supprimée
- ✅ `prisma/schema.prisma` : `Student.status` default → `ACTIVE`
- ✅ `app/admin/students/page.tsx` : KPI "Paiements à suivre" / "Encaisse visible" retirés

### Commit `277eb96` (P2-ENROLL continuation)
- ✅ `app/api/enrollments/route.ts` : paramètre `paymentStatus` retiré de `buildEnrollmentWhere`
- ✅ `components/EnrollmentStats.tsx` : KPI "Paiements soldés" et "Encaissements" retirés
- ✅ `components/EnrollmentFilters.tsx` : dropdown filtre paiement retiré

---

## 🔧 TÂCHES NON COMMENCÉES (P2/P3)

### P2-SESSIONS (non critique)
- Bouton duplication rapide session
- Validations formulaire dates cohérentes
- Modèles de session (templates)

### P3-AUTRES
- Certificats : déjà OK (pas de dépendance paiement)
- Notifications : déjà OK (pas de trigger paiement)

---

## 📋 CHECKLIST POUR FINALISER

### Actions immédiates (backend)
- [ ] Vérifier migration Prisma `student_status_default_active` appliquée
- [ ] Tester une nouvelle inscription depuis l'espace étudiant → doit être `confirmed` + compte actif immédiat

### Nettoyage manuel UI (ordre recommandé)
1. [ ] `components/EnrollmentPreviewModal.tsx` : supprimer blocs paiement (impact : modal dossier étudiant)
2. [ ] `app/admin/students/page.tsx` : supprimer colonne + bloc 360 paiement (impact : liste étudiants)
3. [ ] `app/admin/enrollments/page.tsx` : nettoyer `initialFilters` (impact : minime, filtre UI déjà retiré)
4. [ ] `lib/admin/reporting.ts` : supprimer calculs paiement (impact : perfs dashboard)
5. [ ] `app/admin/dashboard/page.tsx` : nettoyer type `DashboardPayload` (impact : types TS)

### Tests de régression
- [ ] Inscription étudiant → compte actif sans validation admin
- [ ] Bouton "Confirmer paiement" dans EnrollmentPreviewModal → erreur HTTP 410 (attendu)
- [ ] Dashboard admin → aucun KPI paiement affiché
- [ ] Page enrollments → filtre paiement absent
- [ ] Page students → métriques sans paiement

---

## 🎯 ÉTAT ACTUEL vs ATTENDU

| Élément | État actuel | Attendu |
|---------|-------------|---------|
| Inscription étudiant | ✅ Auto-confirmation + provisioning | ✅ |
| API confirmPayment | ✅ HTTP 410 | ✅ |
| Dashboard KPI paiement (UI) | ✅ Masqués | ✅ |
| Dashboard KPI paiement (backend) | ❌ Calcul inutile | ❌ À supprimer |
| EnrollmentPreviewModal | ❌ Blocs paiement affichés | ❌ À supprimer |
| Students page (tableau) | ❌ Colonne paiement | ❌ À supprimer |
| Students page (KPI) | ✅ Nettoyés | ✅ |
| Enrollments filters | ✅ Filtre paiement retiré | ✅ |
| Enrollments stats | ✅ KPI paiement retirés | ✅ |

---

## 💡 RECOMMANDATIONS

**Si modifications manuelles trop lourdes :**
- Les fichiers bloqués (`EnrollmentPreviewModal`, `students/page.tsx`) peuvent rester en l'état temporairement
- Impact utilisateur : blocs UI non-fonctionnels affichés, mais pas de casse fonctionnelle
- L'essentiel (auto-activation, provisioning, suppression validation admin) est déjà fait

**Migration Prisma :**
- Vérifier que la migration `student_status_default_active` s'est bien terminée avant de mettre en production

**Prochaine session de dev :**
- Priorité 1 : `EnrollmentPreviewModal` (expérience utilisateur la plus impactée)
- Priorité 2 : `lib/admin/reporting.ts` (performances)
- Priorité 3 : nettoyage types TS

#!/bin/bash
# 🧪 Script de Vérification - Système d'Inscriptions

echo "=========================================="
echo "🧪 VÉRIFICATION DU SYSTÈME D'INSCRIPTIONS"
echo "=========================================="
echo ""

# 1. Vérifier les fichiers créés
echo "1️⃣  Vérification des fichiers..."
echo ""

files_to_check=(
  "lib/email.ts"
  "app/api/enrollments/[id]/route.ts"
  "components/EnrollmentStatusChanger.tsx"
  "components/AdminEnrollmentTable.tsx"
  "prisma/schema.prisma"
)

for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MANQUANT)"
  fi
done

echo ""
echo "2️⃣  Vérification du build..."
echo ""

# Test build
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build réussit"
else
  echo "  ❌ Build échoué"
  exit 1
fi

echo ""
echo "3️⃣  Vérification des dépendances..."
echo ""

# Vérifier nodemailer
if npm list nodemailer > /dev/null 2>&1; then
  echo "  ✅ nodemailer installé"
else
  echo "  ❌ nodemailer manquant"
fi

echo ""
echo "4️⃣  Vérification des variables d'environnement..."
echo ""

required_vars=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -n "${!var}" ]; then
    echo "  ✅ $var configuré"
  else
    echo "  ⚠️  $var non configuré (optionnel pour dev)"
  fi
done

echo ""
echo "5️⃣  Vérification des fichiers de documentation..."
echo ""

docs=(
  "README_IMPLEMENTATION.md"
  "QUICK_ENROLLMENT_GUIDE.md"
  "GMAIL_SETUP.md"
  "EMAIL_SETUP.md"
  "ENROLLMENT_SYSTEM_SUMMARY.md"
  "DEPLOYMENT_GUIDE.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc (MANQUANT)"
  fi
done

echo ""
echo "=========================================="
echo "✅ VÉRIFICATION TERMINÉE"
echo "=========================================="
echo ""
echo "🚀 Prochaines étapes:"
echo "1. Configurer .env avec MAIL_* variables"
echo "2. Lancer: npm run dev"
echo "3. Tester l'inscription + admin"
echo "4. Consulter QUICK_ENROLLMENT_GUIDE.md"
echo ""

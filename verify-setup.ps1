# 🧪 Script de Vérification - Système d'Inscriptions (PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🧪 VÉRIFICATION DU SYSTÈME D'INSCRIPTIONS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier les fichiers créés
Write-Host "1️⃣  Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$files = @(
  "lib/email.ts",
  "app/api/enrollments/[id]/route.ts",
  "components/EnrollmentStatusChanger.tsx",
  "components/AdminEnrollmentTable.tsx",
  "prisma/schema.prisma"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "  ✅ $file" -ForegroundColor Green
  } else {
    Write-Host "  ❌ $file (MANQUANT)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "2️⃣  Vérification du build..." -ForegroundColor Yellow
Write-Host ""

$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "  ✅ Build réussit" -ForegroundColor Green
} else {
  Write-Host "  ❌ Build échoué" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "3️⃣  Vérification des dépendances..." -ForegroundColor Yellow
Write-Host ""

$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
if ($packageJson.dependencies.nodemailer) {
  Write-Host "  ✅ nodemailer installé (v$($packageJson.dependencies.nodemailer))" -ForegroundColor Green
} else {
  Write-Host "  ❌ nodemailer manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣  Vérification des variables d'environnement..." -ForegroundColor Yellow
Write-Host ""

$envVars = @("DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET")
foreach ($var in $envVars) {
  if (Test-Path env:$var) {
    Write-Host "  ✅ $var configuré" -ForegroundColor Green
  } else {
    Write-Host "  ⚠️  $var non configuré (optionnel pour dev)" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "5️⃣  Vérification des fichiers de documentation..." -ForegroundColor Yellow
Write-Host ""

$docs = @(
  "README_IMPLEMENTATION.md",
  "QUICK_ENROLLMENT_GUIDE.md",
  "GMAIL_SETUP.md",
  "EMAIL_SETUP.md",
  "ENROLLMENT_SYSTEM_SUMMARY.md",
  "DEPLOYMENT_GUIDE.md",
  "API_EXAMPLES.md",
  "FILES_MODIFIED_SUMMARY.md"
)

foreach ($doc in $docs) {
  if (Test-Path $doc) {
    Write-Host "  ✅ $doc" -ForegroundColor Green
  } else {
    Write-Host "  ❌ $doc (MANQUANT)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ VÉRIFICATION TERMINÉE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Green
Write-Host "1. Configurer .env avec MAIL_* variables" -ForegroundColor White
Write-Host "2. Lancer: npm run dev" -ForegroundColor White
Write-Host "3. Tester l'inscription + admin" -ForegroundColor White
Write-Host "4. Consulter QUICK_ENROLLMENT_GUIDE.md" -ForegroundColor White
Write-Host ""

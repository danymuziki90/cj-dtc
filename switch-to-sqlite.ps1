# Script pour basculer temporairement vers SQLite pour le développement

Write-Host "=== Basculement vers SQLite (temporaire) ===" -ForegroundColor Cyan
Write-Host ""

# Sauvegarder le schéma actuel
Copy-Item "prisma\schema.prisma" "prisma\schema.prisma.backup" -Force
Write-Host "✓ Schéma Prisma sauvegardé" -ForegroundColor Green

# Lire le schéma
$schema = Get-Content "prisma\schema.prisma" -Raw

# Remplacer PostgreSQL par SQLite
$schema = $schema -replace 'provider = "postgresql"', 'provider = "sqlite"'
$schema = $schema -replace 'url      = env\("DATABASE_URL"\)', 'url      = "file:./dev.db"'

# Écrire le nouveau schéma
$schema | Set-Content "prisma\schema.prisma"
Write-Host "✓ Schéma modifié pour SQLite" -ForegroundColor Green

# Mettre à jour .env si nécessaire
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch 'DATABASE_URL.*sqlite') {
        $envContent = $envContent -replace 'DATABASE_URL=.*', 'DATABASE_URL="file:./dev.db"'
        $envContent | Set-Content ".env"
        Write-Host "✓ Fichier .env mis à jour" -ForegroundColor Green
    }
} else {
    "DATABASE_URL=`"file:./dev.db`"" | Out-File ".env" -Encoding utf8
    Write-Host "✓ Fichier .env créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "Maintenant, exécutez:" -ForegroundColor Cyan
Write-Host "   npx prisma migrate dev --name add_enrollments" -ForegroundColor White
Write-Host "   npx prisma generate" -ForegroundColor White
Write-Host ""
Write-Host "Note: Pour revenir à PostgreSQL, restaurez prisma\schema.prisma.backup" -ForegroundColor Yellow

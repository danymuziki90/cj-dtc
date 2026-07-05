# Script de configuration de la base de donnees pour CJ DEVELOPMENT TRAINING CENTER

Write-Host "=== Configuration de la Base de Donnees CJ DEVELOPMENT TRAINING CENTER ===" -ForegroundColor Cyan
Write-Host ""

# Verifier si PostgreSQL est accessible
Write-Host "1. Verification de PostgreSQL..." -ForegroundColor Yellow
$pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($pgTest) {
    Write-Host "   PostgreSQL est accessible sur le port 5432" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant executer:" -ForegroundColor Cyan
    Write-Host "   npx prisma migrate dev --name add_enrollments" -ForegroundColor White
} else {
    Write-Host "   PostgreSQL n'est pas accessible sur le port 5432" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPTION 1: Utiliser Supabase (Gratuit, Recommande)" -ForegroundColor Cyan
    Write-Host "   1. Allez sur https://supabase.com et creez un compte gratuit" -ForegroundColor White
    Write-Host "   2. Creez un nouveau projet" -ForegroundColor White
    Write-Host "   3. Allez dans Settings > Database" -ForegroundColor White
    Write-Host "   4. Copiez la connection string (URI)" -ForegroundColor White
    Write-Host "   5. Mettez a jour votre fichier .env avec:" -ForegroundColor White
    Write-Host "      DATABASE_URL=votre_connection_string_supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPTION 2: Installer PostgreSQL localement" -ForegroundColor Cyan
    Write-Host "   1. Telechargez depuis: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   2. Installez avec les parametres par defaut" -ForegroundColor White
    Write-Host "   3. Creez la base de donnees avec pgAdmin ou psql:" -ForegroundColor White
    Write-Host "      CREATE DATABASE cjdtc;" -ForegroundColor Gray
    Write-Host "   4. Mettez a jour votre .env:" -ForegroundColor White
    Write-Host "      DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/cjdtc?schema=public" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPTION 3: Utiliser SQLite temporairement (pour developpement)" -ForegroundColor Cyan
    Write-Host "   Executez: .\switch-to-sqlite.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "=== Verification du fichier .env ===" -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "   Fichier .env trouve" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   DATABASE_URL est defini" -ForegroundColor Green
        $dbUrl = ($envContent | Select-String -Pattern "DATABASE_URL=(.+)").Matches.Groups[1].Value
        if ($dbUrl -match "postgresql") {
            Write-Host "   Configuration PostgreSQL detectee" -ForegroundColor Yellow
        } elseif ($dbUrl -match "sqlite") {
            Write-Host "   Configuration SQLite detectee" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   DATABASE_URL n'est pas defini dans .env" -ForegroundColor Red
    }
} else {
    Write-Host "   Fichier .env non trouve" -ForegroundColor Red
    Write-Host "   Creez un fichier .env avec DATABASE_URL" -ForegroundColor Yellow
}

Write-Host ""

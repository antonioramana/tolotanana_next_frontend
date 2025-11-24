# Script PowerShell pour vérifier le lockfile
Write-Host "🔍 Vérification du lockfile..." -ForegroundColor Cyan

# Vérifier si pnpm-lock.yaml existe
if (-not (Test-Path "pnpm-lock.yaml")) {
    Write-Host "❌ pnpm-lock.yaml non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier si package.json a été modifié
$packageJsonModified = git diff --quiet HEAD~1 package.json
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ package.json inchangé, lockfile à jour" -ForegroundColor Green
} else {
    Write-Host "⚠️  package.json modifié, mise à jour du lockfile..." -ForegroundColor Yellow
    pnpm install --frozen-lockfile=false
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lockfile mis à jour avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la mise à jour du lockfile" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vérification terminée" -ForegroundColor Green








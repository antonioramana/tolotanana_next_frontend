#!/bin/bash

# Script pour s'assurer que le lockfile est à jour avant le déploiement
echo "🔍 Vérification du lockfile..."

# Vérifier si pnpm-lock.yaml existe
if [ ! -f "pnpm-lock.yaml" ]; then
  echo "❌ pnpm-lock.yaml non trouvé"
  exit 1
fi

# Vérifier si package.json a été modifié depuis le dernier commit
if git diff --quiet HEAD~1 package.json; then
  echo "✅ package.json inchangé, lockfile à jour"
else
  echo "⚠️  package.json modifié, mise à jour du lockfile..."
  pnpm install --frozen-lockfile=false
  if [ $? -eq 0 ]; then
    echo "✅ Lockfile mis à jour avec succès"
  else
    echo "❌ Erreur lors de la mise à jour du lockfile"
    exit 1
  fi
fi

echo "✅ Vérification terminée"

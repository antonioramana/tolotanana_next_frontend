#!/bin/bash

# Script de déploiement pour Netlify
echo "🚀 Déploiement de Tolotanana Frontend sur Netlify..."

# Vérification des prérequis
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Build du projet
echo "📦 Construction du projet..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

# Commit et push des changements
echo "📝 Commit des changements..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "✅ Déploiement terminé ! Vérifiez votre site sur Netlify."


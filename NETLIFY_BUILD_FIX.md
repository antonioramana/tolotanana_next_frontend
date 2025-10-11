# Solution Erreur Build Netlify - Lockfile Outdated

## 🔍 Problème identifié

L'erreur suivante se produisait lors du déploiement Netlify :

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
specifiers in the lockfile don't match specifiers in package.json:
* 1 dependencies were added: @types/react-google-recaptcha@^2.1.9
```

## 🔧 Cause du problème

Le fichier `pnpm-lock.yaml` n'était pas synchronisé avec `package.json` après l'ajout de nouvelles dépendances pour le système de captcha.

## ✅ Solution appliquée

### 1. **Mise à jour du lockfile**
```bash
pnpm install
```

### 2. **Vérification du build**
```bash
npm run build
```

### 3. **Configuration Netlify optimisée**
Création du fichier `.netlify.toml` avec :
- Version Node.js spécifiée (22.20.0)
- Configuration Next.js optimisée
- Headers de sécurité
- Redirections pour les pages dynamiques

## 🛠️ Prévention des erreurs futures

### Scripts de vérification
- `scripts/check-lockfile.sh` (Linux/Mac)
- `scripts/check-lockfile.ps1` (Windows)

### Workflow recommandé
1. **Avant chaque commit** :
   ```bash
   pnpm install
   npm run build
   ```

2. **Avant le déploiement** :
   ```bash
   pnpm install --frozen-lockfile=false
   ```

3. **Vérification automatique** :
   ```bash
   # Linux/Mac
   ./scripts/check-lockfile.sh
   
   # Windows
   .\scripts\check-lockfile.ps1
   ```

## 📋 Configuration Netlify

### Variables d'environnement requises
```
NEXT_PUBLIC_API_BASE=https://your-backend-url.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Build settings
- **Build command** : `npm run build`
- **Publish directory** : `.next`
- **Node version** : `22.20.0`

## 🎯 Résultat

- ✅ Build Netlify réussi
- ✅ Lockfile synchronisé
- ✅ Configuration optimisée
- ✅ Déploiement fonctionnel

## 📝 Notes importantes

1. **Toujours commiter le lockfile** : `pnpm-lock.yaml` doit être versionné
2. **Utiliser pnpm de manière cohérente** : Ne pas mélanger npm et pnpm
3. **Tester localement** : Toujours tester le build avant de pousser
4. **Surveiller les dépendances** : Vérifier les warnings de dépendances obsolètes

## 🔗 Liens utiles

- [Documentation pnpm](https://pnpm.io/)
- [Configuration Netlify Next.js](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Next.js Build Optimization](https://nextjs.org/docs/advanced-features/static-html-export)

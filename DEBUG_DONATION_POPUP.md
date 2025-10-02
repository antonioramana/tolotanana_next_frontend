# 🐛 Guide de Débogage - Popup de Remerciement

## Problème
Le popup de remerciement ne s'affiche pas après avoir effectué un don.

## 🔍 Étapes de Débogage

### Étape 1: Vérifier que le Backend fonctionne

1. **Démarrer le backend** :
   ```bash
   cd tolotanana-backend
   npm run start:dev
   ```

2. **Tester l'API manuellement** :
   ```bash
   cd tolotanana-frontend
   node test-donation-api.js
   ```

3. **Vérifier les endpoints** :
   - `GET http://localhost:4750/health` → Doit retourner 200
   - `GET http://localhost:4750/campaigns` → Doit retourner la liste des campagnes
   - `POST http://localhost:4750/donations` → Doit créer une donation

### Étape 2: Tester le Popup Directement

1. **Aller sur une page de campagne**
2. **Cliquer sur le bouton rose "🧪 TEST: Afficher popup remerciement"**
3. **Le popup devrait s'afficher immédiatement**

Si le popup ne s'affiche pas avec le bouton de test :
- ❌ **Problème CSS/Z-index** → Le popup est masqué
- ❌ **Problème JavaScript** → Erreur dans le composant

### Étape 3: Vérifier les Logs de la Console

1. **Ouvrir les outils de développement** (F12)
2. **Aller dans l'onglet Console**
3. **Faire un don normal et regarder les logs** :

#### Logs attendus lors d'un don :
```
🚨🚨🚨 DÉBUT handleDonation - CETTE FONCTION S'EXÉCUTE-T-ELLE ? 🚨🚨🚨
donationAmount: "50000"
isInactive: false
campaign.id: "cm123456789"
✅ Validation passée, création du don...
📤 Envoi des données du don à l'API: {...}
📤 URL de l'API: http://localhost:4750/donations
✅ Don créé avec succès - Réponse complète: {...}
🎉 Affichage du popup de remerciement
Message de remerciement à afficher: "Votre message..."
```

### Étape 4: Diagnostics par Logs

#### Si vous ne voyez pas "🚨🚨🚨 DÉBUT handleDonation" :
- ❌ **Le bouton Continuer ne fonctionne pas**
- ❌ **Le formulaire a des erreurs de validation**
- ❌ **JavaScript bloqué par une erreur**

#### Si vous voyez le début mais pas "✅ Validation passée" :
- ❌ **Montant invalide** (vérifiez que c'est un nombre > 0)
- ❌ **Campagne inactive** (vérifiez le statut de la campagne)
- ❌ **Nom requis** (si don non-anonyme, vérifiez le nom)

#### Si vous voyez "📤 Envoi des données" mais pas "✅ Don créé" :
- ❌ **Problème réseau** (backend non démarré)
- ❌ **Erreur API** (campagne inexistante, données invalides)
- ❌ **Problème CORS** (vérifiez la configuration)

#### Si vous voyez "✅ Don créé" mais pas "🎉 Affichage du popup" :
- ❌ **Erreur dans setTimeout** (très rare)
- ❌ **État React non mis à jour**

### Étape 5: Vérifications Spécifiques

#### Vérifier l'état de la campagne :
```javascript
// Dans la console du navigateur
console.log('Campaign status:', campaign.status);
console.log('Campaign deadline:', new Date(campaign.deadline));
console.log('Is expired:', new Date(campaign.deadline) < new Date());
```

#### Vérifier les variables d'état :
```javascript
// Dans la console du navigateur
console.log('showThankYouPopup:', showThankYouPopup);
console.log('thankYouMessage:', thankYouMessage);
console.log('isSubmitting:', isSubmitting);
```

### Étape 6: Solutions Communes

#### Solution 1: Redémarrer les serveurs
```bash
# Terminal 1 - Backend
cd tolotanana-backend
npm run start:dev

# Terminal 2 - Frontend  
cd tolotanana-frontend
npm run dev
```

#### Solution 2: Vider le cache du navigateur
- Ctrl+Shift+R (rechargement forcé)
- Ou F12 → Network → Disable cache

#### Solution 3: Vérifier les variables d'environnement
```bash
# Dans tolotanana-frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:4750
```

#### Solution 4: Forcer l'affichage du popup (test)
Ajoutez temporairement dans `handleDonation` après la création du don :
```javascript
// Force l'affichage pour test
console.log('🔧 FORCE: Affichage du popup');
setShowThankYouPopup(true);
```

### Étape 7: Test avec cURL (Avancé)

Si l'interface ne fonctionne pas, testez directement l'API :

```bash
# Créer une donation via cURL
curl -X POST http://localhost:4750/donations \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "VOTRE_CAMPAIGN_ID",
    "amount": 50000,
    "message": "Test cURL",
    "donorName": "Test User",
    "isAnonymous": false,
    "paymentMethod": "mobile_money"
  }'
```

## 🎯 Checklist de Débogage

- [ ] Backend démarré et accessible
- [ ] Frontend démarré sans erreurs
- [ ] Bouton de test popup fonctionne
- [ ] Console ouverte pour voir les logs
- [ ] Don effectué avec logs complets
- [ ] Variables d'environnement correctes
- [ ] Cache navigateur vidé
- [ ] Campagne active et valide

## 🆘 Si Rien ne Fonctionne

1. **Créer une campagne de test simple**
2. **Créer un message de remerciement pour cette campagne**
3. **Utiliser le bouton de test rose pour vérifier le popup**
4. **Faire un don de 1000 Ar sur cette campagne**
5. **Partager les logs de la console**

---

**Une fois le problème identifié, n'oubliez pas de supprimer le bouton de test rose !** 🧹

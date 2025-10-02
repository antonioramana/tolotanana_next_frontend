# 💰 Guide des Frais de Plateforme Dynamiques

## 🎯 Vue d'ensemble

Le système de frais de plateforme dynamiques permet aux administrateurs de configurer et modifier les pourcentages de frais appliqués aux donations en temps réel, sans redéploiement de l'application.

## 🏗️ Architecture

### Backend (NestJS + Prisma)

#### 1. Modèle de Base de Données
```prisma
model PlatformFees {
  id          String   @id @default(cuid())
  percentage  Float    @default(5.0)
  isActive    Boolean  @default(true)
  description String?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  creator     User     @relation(fields: [createdBy], references: [id])
}
```

#### 2. API Endpoints

**Admin (Authentifié) :**
- `POST /platform-fees` - Créer nouveaux frais
- `GET /platform-fees` - Lister tous les frais
- `GET /platform-fees/active` - Obtenir frais actifs
- `GET /platform-fees/:id` - Obtenir frais par ID
- `PATCH /platform-fees/:id` - Modifier frais
- `PATCH /platform-fees/:id/set-active` - Activer frais
- `DELETE /platform-fees/:id` - Supprimer frais

**Public :**
- `GET /public/platform-fees/active` - Obtenir pourcentage actif (pour frontend)

#### 3. Logique Métier
- ✅ Un seul frais peut être actif à la fois
- ✅ Création automatique de frais par défaut (5%) si aucun n'existe
- ✅ Impossible de supprimer le dernier frais actif
- ✅ Calcul dynamique dans les donations

### Frontend (Next.js + React)

#### 1. Interface Admin
**Page :** `/admin/settings/platform-fees`
- ✅ Créer nouveaux frais
- ✅ Modifier frais existants
- ✅ Activer/désactiver frais
- ✅ Supprimer frais (avec protection)
- ✅ Historique des modifications

#### 2. Affichage Public
**Composants mis à jour :**
- ✅ `CampaignDetailClient.tsx` - Modal de donation
- ✅ `app/payment/page.tsx` - Page de paiement
- ✅ Messages de remerciement

## 🚀 Utilisation

### Pour les Administrateurs

1. **Accéder aux paramètres :**
   ```
   /admin/settings → Frais de Plateforme
   ```

2. **Créer de nouveaux frais :**
   - Cliquer sur "Nouveaux Frais"
   - Saisir le pourcentage (0-100%)
   - Ajouter une description (optionnel)
   - Valider

3. **Modifier les frais actifs :**
   - Cliquer sur "Modifier" sur les frais souhaités
   - Ajuster le pourcentage
   - Sauvegarder

4. **Changer les frais actifs :**
   - Cliquer sur "Activer" sur les frais souhaités
   - Les anciens frais seront automatiquement désactivés

### Pour les Développeurs

#### 1. Ajouter l'affichage dynamique
```typescript
// Charger les frais actifs
const [platformFees, setPlatformFees] = useState({ percentage: 5.0 });

useEffect(() => {
  const loadFees = async () => {
    try {
      const fees = await PublicPlatformFeesApi.getActive();
      setPlatformFees(fees);
    } catch (error) {
      // Garder 5% par défaut
    }
  };
  loadFees();
}, []);

// Utiliser dans les calculs
const feeAmount = amount * (platformFees.percentage / 100);
const netAmount = amount - feeAmount;
```

#### 2. Affichage dans l'UI
```jsx
<p>Frais de plateforme ({platformFees.percentage}%)</p>
<p>Montant: {formatAmount(feeAmount)}</p>
```

## 🔧 Configuration

### 1. Migration de Base de Données
```bash
cd tolotanana-backend
npx prisma migrate dev --name add_platform_fees
```

### 2. Seeding des Données
```bash
node seed-platform-fees.js
```

### 3. Variables d'Environnement
Aucune variable supplémentaire requise.

## 📊 Fonctionnalités

### ✅ Implémentées
- [x] Modèle de base de données
- [x] API complète (CRUD + activation)
- [x] Interface admin intuitive
- [x] Calcul dynamique dans les donations
- [x] Affichage temps réel dans le frontend
- [x] Protection contre suppression du dernier frais actif
- [x] Frais par défaut automatiques
- [x] Historique des modifications

### 🔄 Améliorations Futures
- [ ] Historique détaillé des changements
- [ ] Notifications aux utilisateurs lors de changements
- [ ] Frais différenciés par type de campagne
- [ ] Frais dégressifs selon le montant
- [ ] Planification de changements de frais

## 🛡️ Sécurité

- ✅ Authentification admin requise pour modifications
- ✅ Validation des pourcentages (0-100%)
- ✅ Protection contre suppression accidentelle
- ✅ Logs des modifications avec créateur

## 🧪 Tests

### Test Manuel
1. **Créer des frais :**
   - Aller sur `/admin/settings/platform-fees`
   - Créer frais à 3%
   - Vérifier activation automatique

2. **Vérifier calculs :**
   - Aller sur une campagne
   - Ouvrir modal de donation
   - Vérifier affichage "3%" au lieu de "5%"

3. **Tester page paiement :**
   - Procéder à un don
   - Vérifier calculs sur `/payment`
   - Confirmer frais à 3%

### Test API
```bash
# Obtenir frais actifs (public)
curl http://localhost:4750/public/platform-fees/active

# Créer nouveaux frais (admin)
curl -X POST http://localhost:4750/platform-fees \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"percentage": 3.5, "description": "Frais réduits"}'
```

## 📈 Impact

### Avantages
- ✅ **Flexibilité** : Ajustement des frais sans redéploiement
- ✅ **Transparence** : Affichage temps réel aux utilisateurs
- ✅ **Contrôle** : Gestion centralisée par les admins
- ✅ **Traçabilité** : Historique des modifications

### Considérations
- ⚠️ **Performance** : Appel API supplémentaire pour récupérer les frais
- ⚠️ **Cache** : Considérer mise en cache côté frontend
- ⚠️ **Cohérence** : S'assurer que tous les composants utilisent les frais dynamiques

---

**🎉 Le système de frais de plateforme dynamiques est maintenant opérationnel !**

Les administrateurs peuvent ajuster les frais en temps réel, et tous les utilisateurs verront immédiatement les nouveaux pourcentages dans leurs donations.

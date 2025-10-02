# 📧 Guide du Système de Contact Dynamique

## 🎯 Vue d'ensemble

Le système de contact dynamique permet aux utilisateurs d'envoyer des messages aux administrateurs via un formulaire public, et aux admins de lire et répondre à ces messages depuis leur interface d'administration.

## 🏗️ Architecture

### Backend (NestJS + Prisma)

#### 1. Modèle de Base de Données
```prisma
model ContactMessage {
  id        String   @id @default(cuid())
  name      String   // Nom de la personne
  email     String   // Email de contact
  subject   String   // Sujet du message
  message   String   @db.Text // Contenu
  isRead    Boolean  @default(false) // Lu par admin
  isReplied Boolean  @default(false) // Répondu
  reply     String?  @db.Text // Réponse admin
  repliedBy String?  // ID admin qui a répondu
  repliedAt DateTime? // Date de réponse
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  replier   User?    @relation(fields: [repliedBy], references: [id])
}
```

#### 2. API Endpoints

**Admin (Authentifié) :**
- `GET /contact` - Lister tous les messages (avec filtres)
- `GET /contact/stats` - Statistiques des messages
- `GET /contact/:id` - Obtenir un message par ID
- `PATCH /contact/:id/read` - Marquer comme lu
- `POST /contact/:id/reply` - Répondre à un message
- `DELETE /contact/:id` - Supprimer un message

**Public :**
- `POST /public/contact` - Envoyer un message de contact

#### 3. Fonctionnalités
- ✅ Filtrage par statut (tous, non lus, répondus)
- ✅ Statistiques en temps réel
- ✅ Marquage automatique comme lu lors de la réponse
- ✅ Historique des réponses avec horodatage
- ✅ Validation des données d'entrée

### Frontend (Next.js + React)

#### 1. Page Publique de Contact
**Route :** `/contact`

**Fonctionnalités :**
- ✅ Formulaire complet (nom, email, sujet, message)
- ✅ Validation côté client
- ✅ Informations de contact de l'entreprise
- ✅ Section FAQ intégrée
- ✅ Design responsive et accessible

#### 2. Interface Admin
**Route :** `/admin/contact`

**Fonctionnalités :**
- ✅ Dashboard avec statistiques
- ✅ Liste des messages avec filtres
- ✅ Indicateurs visuels (nouveau, répondu)
- ✅ Modal de réponse intégrée
- ✅ Actions rapides (marquer lu, supprimer)

## 🚀 Utilisation

### Pour les Utilisateurs

1. **Accéder au formulaire :**
   ```
   /contact (lien dans le footer)
   ```

2. **Envoyer un message :**
   - Remplir le formulaire complet
   - Cliquer sur "Envoyer le message"
   - Recevoir une confirmation

### Pour les Administrateurs

1. **Accéder aux messages :**
   ```
   Sidebar Admin → Messages Contact
   ```

2. **Gérer les messages :**
   - Voir les statistiques en temps réel
   - Filtrer par statut (tous/non lus/répondus)
   - Marquer comme lu
   - Répondre directement
   - Supprimer si nécessaire

3. **Répondre à un message :**
   - Cliquer sur "Répondre"
   - Lire le message original
   - Taper la réponse
   - Envoyer (marque automatiquement comme lu)

## 📊 Fonctionnalités

### ✅ Implémentées

**Backend :**
- [x] Modèle de base de données complet
- [x] API CRUD complète
- [x] Validation des données
- [x] Statistiques en temps réel
- [x] Gestion des réponses
- [x] Authentification admin

**Frontend :**
- [x] Formulaire de contact public
- [x] Interface admin complète
- [x] Statistiques visuelles
- [x] Filtres et recherche
- [x] Modal de réponse
- [x] Indicateurs de statut
- [x] Design responsive

### 🔄 Améliorations Futures
- [ ] Notifications email automatiques
- [ ] Templates de réponses prédéfinies
- [ ] Catégorisation des messages
- [ ] Recherche textuelle avancée
- [ ] Export des messages
- [ ] Archivage automatique

## 🎨 Interface Utilisateur

### Page de Contact Public
- **Design moderne** avec cards et sections organisées
- **Formulaire intuitif** avec validation en temps réel
- **Informations complètes** (email, téléphone, adresse, horaires)
- **FAQ intégrée** pour réduire les messages répétitifs

### Interface Admin
- **Dashboard statistiques** avec métriques clés
- **Liste organisée** avec badges de statut
- **Actions rapides** accessibles d'un clic
- **Modal de réponse** avec contexte complet

## 🔧 Configuration

### 1. Migration de Base de Données
```bash
cd tolotanana-backend
npx prisma migrate dev --name add_contact_messages
```

### 2. Variables d'Environnement
Aucune variable supplémentaire requise.

### 3. Navigation
- **Lien public** : Footer → "Contact"
- **Lien admin** : Sidebar → "Messages Contact"

## 🛡️ Sécurité

- ✅ Validation stricte des données d'entrée
- ✅ Authentification admin requise pour la gestion
- ✅ Protection contre le spam (validation email)
- ✅ Sanitisation des contenus

## 🧪 Tests

### Test Manuel Public
1. Aller sur `/contact`
2. Remplir et envoyer un message
3. Vérifier la confirmation

### Test Manuel Admin
1. Aller sur `/admin/contact`
2. Vérifier les statistiques
3. Lire et répondre à un message
4. Tester les filtres

### Test API
```bash
# Envoyer un message (public)
curl -X POST http://localhost:4750/public/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "Ceci est un message de test"
  }'

# Lister les messages (admin)
curl http://localhost:4750/contact \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📈 Impact

### Avantages
- ✅ **Communication directe** : Canal officiel entre users et admins
- ✅ **Gestion centralisée** : Tous les messages dans une interface
- ✅ **Traçabilité** : Historique complet des échanges
- ✅ **Efficacité** : Réponses rapides avec contexte

### Métriques de Succès
- **Taux de réponse** : % de messages ayant reçu une réponse
- **Temps de réponse moyen** : Délai entre réception et réponse
- **Satisfaction utilisateur** : Feedback sur la qualité du support

---

**🎉 Le système de contact dynamique est maintenant opérationnel !**

Les utilisateurs peuvent facilement contacter l'équipe, et les administrateurs disposent d'une interface complète pour gérer tous les messages efficacement.

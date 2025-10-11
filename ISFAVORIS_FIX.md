# Correction du problème isFavoris toujours false

## Problème identifié

Le champ `isFavoris` restait toujours `false` parce que :

1. **Endpoints sans authentification** : Les endpoints `/campaigns` et `/campaigns/:id` n'avaient pas de garde d'authentification
2. **userId undefined** : Sans authentification, le `userId` était toujours `undefined`
3. **Pas d'endpoints publics** : Les utilisateurs non connectés ne pouvaient pas accéder aux campagnes

## Solution implémentée

### 1. Ajout de l'authentification aux endpoints existants

**Avant:**
```typescript
@Get()
@ApiOperation({ summary: 'Obtenir toutes les campagnes avec filtres' })
async findAll(@CurrentUser('id') userId?: string) {
  // userId était toujours undefined
}
```

**Après:**
```typescript
@Get()
@UseGuards(JwtAuthGuard)  // ← Ajouté
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Obtenir toutes les campagnes avec filtres' })
async findAll(@CurrentUser('id') userId?: string) {
  // userId est maintenant disponible si connecté
}
```

### 2. Création d'endpoints publics

Nouveau contrôleur `PublicCampaignsController` pour les utilisateurs non connectés :

```typescript
@Controller('public/campaigns')
export class PublicCampaignsController {
  @Get()
  async findAll() {
    // Passer userId comme undefined pour les campagnes publiques
    return this.campaignsService.findAll(filters, pagination, undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Passer userId comme undefined pour les campagnes publiques
    return this.campaignsService.findOne(id, undefined);
  }
}
```

### 3. Modification du frontend

Le frontend utilise maintenant les bons endpoints selon l'état de connexion :

```typescript
export const CatalogApi = {
  campaigns: async (query: string = '') => {
    const token = getAuthToken();
    if (token) {
      // Utilisateur connecté → endpoint authentifié avec isFavoris
      return await api(`/campaigns${query}`);
    } else {
      // Utilisateur non connecté → endpoint public sans isFavoris
      return await apiPublic(`/public/campaigns${query}`);
    }
  },
  campaignById: async (id: string) => {
    const token = getAuthToken();
    if (token) {
      return await api(`/campaigns/${id}`);
    } else {
      return await apiPublic(`/public/campaigns/${id}`);
    }
  },
};
```

## Structure des endpoints

### Endpoints authentifiés (avec isFavoris)
- `GET /campaigns` - Liste des campagnes avec `isFavoris`
- `GET /campaigns/:id` - Détail de campagne avec `isFavoris`
- `GET /campaigns/my-campaigns` - Mes campagnes avec `isFavoris`

### Endpoints publics (sans isFavoris)
- `GET /public/campaigns` - Liste des campagnes publiques
- `GET /public/campaigns/:id` - Détail de campagne publique

### Endpoints de favoris
- `POST /campaigns/:id/toggle-favorite` - Toggle favoris
- `GET /favorites/my-favorites` - Mes favoris

## Comportement attendu

### Utilisateur connecté
- ✅ Accès aux endpoints authentifiés
- ✅ Champ `isFavoris` disponible dans les réponses
- ✅ Possibilité de toggle les favoris
- ✅ Boutons de favoris fonctionnels

### Utilisateur non connecté
- ✅ Accès aux endpoints publics
- ✅ Champ `isFavoris` toujours `false` (ou absent)
- ❌ Boutons de favoris cachés ou non fonctionnels
- ✅ Redirection vers login si tentative de toggle

## Tests

Pour tester la correction :

1. **Script Node.js** : `node test-campaigns-favorites.js`
2. **Page de test** : `/test-favorites`
3. **Fonctionnalité** : 
   - Se connecter et vérifier que `isFavoris` est correct
   - Se déconnecter et vérifier que les campagnes sont toujours accessibles

## Vérification

Les modifications suivantes ont été apportées :
- ✅ `campaigns.controller.ts` - Ajout de `@UseGuards(JwtAuthGuard)`
- ✅ `public-campaigns.controller.ts` - Nouveau contrôleur public
- ✅ `campaigns.module.ts` - Ajout du contrôleur public
- ✅ `api.ts` - Logique de sélection d'endpoint selon l'auth

Le champ `isFavoris` devrait maintenant être correctement retourné pour les utilisateurs connectés !

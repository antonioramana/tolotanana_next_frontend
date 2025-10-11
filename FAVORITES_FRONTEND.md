# Système de Favoris - Frontend

## Vue d'ensemble

Le système de favoris permet aux utilisateurs de marquer des campagnes comme favorites et de les retrouver facilement. Il est intégré dans les pages d'accueil et de détail des campagnes.

## Composants

### 1. FavoriteToggle

Composant réutilisable pour basculer le statut favori d'une campagne.

**Props:**
- `isFavoris: boolean` - Statut actuel du favori
- `onToggle: () => void` - Fonction appelée lors du clic
- `isLoading?: boolean` - État de chargement
- `size?: "sm" | "md" | "lg"` - Taille du bouton
- `className?: string` - Classes CSS supplémentaires

**Exemple d'utilisation:**
```tsx
<FavoriteToggle
  isFavoris={favorites.isFavoris}
  onToggle={favorites.toggleFavorite}
  isLoading={favorites.isLoading}
  size="md"
  className="shadow-lg"
/>
```

### 2. useFavorites Hook

Hook personnalisé pour gérer les favoris d'une campagne spécifique.

**Paramètres:**
- `campaignId: string` - ID de la campagne
- `initialIsFavoris?: boolean` - État initial du favori

**Retour:**
- `isFavoris: boolean` - Statut actuel du favori
- `isLoading: boolean` - État de chargement
- `toggleFavorite: () => Promise<void>` - Basculer le favori
- `addToFavorites: () => Promise<void>` - Ajouter aux favoris
- `removeFromFavorites: () => Promise<void>` - Retirer des favoris

**Exemple d'utilisation:**
```tsx
const favorites = useFavorites({
  campaignId: campaign.id,
  initialIsFavoris: campaign.isFavoris || false
});
```

### 3. useMyFavorites Hook

Hook pour récupérer tous les favoris de l'utilisateur connecté.

**Retour:**
- `favorites: Campaign[]` - Liste des campagnes favorites
- `isLoading: boolean` - État de chargement
- `error: string | null` - Erreur éventuelle
- `refetch: () => Promise<void>` - Recharger les favoris
- `hasNextPage: boolean` - Y a-t-il plus de pages
- `loadMore: () => Promise<void>` - Charger plus de favoris

**Exemple d'utilisation:**
```tsx
const { favorites, isLoading, error, refetch } = useMyFavorites();
```

## Intégration

### Page d'accueil (CampaignCard)

Le composant `CampaignCard` utilise automatiquement le système de favoris :

```tsx
// Dans CampaignCard
const favorites = useFavorites({
  campaignId: campaign.id,
  initialIsFavoris: campaign.isFavoris || false
});

// Dans le JSX
{currentUser && (
  <FavoriteToggle
    isFavoris={favorites.isFavoris}
    onToggle={favorites.toggleFavorite}
    isLoading={favorites.isLoading}
    size="sm"
    className="shadow-lg"
  />
)}
```

### Page de détail de campagne

Le composant `CampaignDetailClient` utilise également le système de favoris :

```tsx
// Dans CampaignDetailClient
const favorites = useFavorites({
  campaignId: campaign.id,
  initialIsFavoris: campaign.isFavoris || false
});

// Dans le JSX
{currentUser && (
  <FavoriteToggle
    isFavoris={favorites.isFavoris}
    onToggle={favorites.toggleFavorite}
    isLoading={favorites.isLoading}
    size="md"
    className="shadow-lg"
  />
)}
```

### Page des favoris

Page dédiée pour afficher tous les favoris de l'utilisateur :

```tsx
// Dans /dashboard/favorites/page.tsx
const { favorites, isLoading, error, refetch } = useMyFavorites();

return (
  <div>
    {favorites.map(campaign => (
      <CampaignCard key={campaign.id} campaign={campaign} />
    ))}
  </div>
);
```

## API Backend

Le frontend communique avec les endpoints suivants :

- `POST /campaigns/:id/toggle-favorite` - Basculer le favori
- `POST /campaigns/:id/favorite` - Ajouter aux favoris
- `DELETE /campaigns/:id/favorite` - Retirer des favoris
- `GET /favorites/my-favorites` - Récupérer mes favoris
- `GET /campaigns` - Liste des campagnes (avec `isFavoris`)
- `GET /campaigns/:id` - Détail de campagne (avec `isFavoris`)

## Gestion des erreurs

Le système gère automatiquement :
- Les erreurs de connexion
- Les erreurs d'authentification
- Les erreurs de validation
- Les états de chargement

Les erreurs sont affichées via des toasts et des messages d'erreur appropriés.

## États visuels

### Bouton FavoriteToggle

**État normal (pas favori):**
- Fond blanc avec bordure grise
- Icône cœur rouge vide
- Hover: bordure rouge et fond rouge clair

**État favori:**
- Fond rouge clair avec bordure rouge
- Icône cœur rouge rempli
- Hover: fond rouge plus foncé

**État de chargement:**
- Opacité réduite
- Curseur non autorisé
- Animation de pulsation sur l'icône

## Tests

Pour tester le système de favoris :

1. Allez sur `/test-favorites`
2. Connectez-vous si nécessaire
3. Testez les boutons de favoris sur les campagnes
4. Vérifiez que les changements sont persistés

## Notes importantes

1. **Authentification requise** : Les favoris ne sont disponibles que pour les utilisateurs connectés
2. **Synchronisation** : Les changements sont automatiquement synchronisés avec le backend
3. **Performance** : Les requêtes sont optimisées et mises en cache
4. **Accessibilité** : Les boutons ont des labels ARIA appropriés
5. **Responsive** : Le système s'adapte à toutes les tailles d'écran

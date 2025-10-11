# Correction de l'erreur API - useFavorites

## Problème identifié

L'erreur `api.post is not a function` était causée par une mauvaise utilisation de l'API dans les hooks de favoris.

## Cause

Le fichier `lib/api.ts` exporte une fonction `api` et non un objet avec des méthodes comme `api.post()`, `api.get()`, etc.

```typescript
// ❌ Incorrect
const response = await api.post('/endpoint');

// ✅ Correct  
const response = await api('/endpoint', { method: 'POST' });
```

## Corrections apportées

### 1. Hook useFavorites

**Avant:**
```typescript
const response = await api.post(`/campaigns/${campaignId}/toggle-favorite`);
const { isFavoris: newIsFavoris, message } = response.data;
```

**Après:**
```typescript
const response = await api(`/campaigns/${campaignId}/toggle-favorite`, {
  method: 'POST',
});
const { isFavoris: newIsFavoris, message } = response;
```

### 2. Hook useMyFavorites

**Avant:**
```typescript
const response = await api.get(`/favorites/my-favorites`, {
  params: { page: pageNum, limit: 10 }
});
const { data, meta } = response.data;
```

**Après:**
```typescript
const params = new URLSearchParams({
  page: pageNum.toString(),
  limit: '10'
});
const response = await api(`/favorites/my-favorites?${params.toString()}`);
const { data, meta } = response;
```

### 3. Page de test

**Avant:**
```typescript
const response = await api.get('/campaigns?page=1&limit=5');
setCampaigns(response.data.data || []);
```

**Après:**
```typescript
const response = await api('/campaigns?page=1&limit=5');
setCampaigns(response.data || []);
```

## Structure de l'API

L'API utilise une fonction unique `api` qui accepte :
- `path: string` - L'endpoint à appeler
- `options: RequestInit` - Options de la requête (method, body, headers, etc.)

```typescript
// Exemples d'utilisation
await api('/endpoint'); // GET par défaut
await api('/endpoint', { method: 'POST', body: JSON.stringify(data) });
await api('/endpoint', { method: 'DELETE' });
```

## Gestion des erreurs

Les erreurs sont maintenant gérées correctement :
- `error.message` au lieu de `error.response?.data?.message`
- `response` au lieu de `response.data`

## Tests

Pour tester la correction :

1. **Script Node.js** : `node test-favorites-api.js`
2. **Page de test** : `/test-favorites`
3. **Fonctionnalité** : Utiliser les boutons de favoris sur les campagnes

## Vérification

Les hooks suivants ont été corrigés :
- ✅ `useFavorites.ts`
- ✅ `useMyFavorites.ts`
- ✅ `test-favorites/page.tsx`

Tous les appels API utilisent maintenant la syntaxe correcte avec la fonction `api()`.

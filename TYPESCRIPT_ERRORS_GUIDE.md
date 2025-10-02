# 🔧 Guide de Résolution des Erreurs TypeScript

## ⚠️ **Erreurs Courantes et Solutions**

### 🚨 **Erreur : "An object literal cannot have multiple properties with the same name"**

#### **Symptômes**
```typescript
Type error: An object literal cannot have multiple properties with the same name.
> 309 |               backgroundColor: !message.isRead ? '#eff6ff' : 'white'
      |               ^
```

#### **Cause**
Propriété **dupliquée** dans un objet de style ou de configuration.

#### **✅ Solution**
```typescript
// ❌ Incorrect - propriété dupliquée
style={{
  backgroundColor: 'white',
  border: '1px solid #ccc',
  backgroundColor: condition ? 'blue' : 'white' // ERREUR !
}}

// ✅ Correct - une seule propriété
style={{
  border: '1px solid #ccc',
  backgroundColor: condition ? 'blue' : 'white'
}}
```

---

### 🚨 **Erreur : "Property 'X' is missing in type 'Y' but required in type 'Z'"**

#### **Symptômes**
```typescript
Property 'isHighlight' is missing in type '{ id: string; name: string; ... }' 
but required in type 'PublicTestimonial'.
```

#### **Cause**
**Incompatibilité** entre le type de données reçu de l'API et le type TypeScript attendu.

#### **✅ Solutions**

##### **Option 1 : Corriger l'API Backend**
```typescript
// Dans le service backend
select: {
  id: true,
  name: true,
  isHighlight: true, // ✅ Ajouter la propriété manquante
  // ...
}
```

##### **Option 2 : Corriger le Type Frontend**
```typescript
// Dans lib/api.ts
getHighlighted: () => apiPublic<Array<{
  id: string;
  name: string;
  isHighlight: boolean; // ✅ Ajouter au type de retour
  // ...
}>>('/public/testimonials/highlighted')
```

##### **Option 3 : Rendre la Propriété Optionnelle**
```typescript
// Dans types/index.ts
export interface PublicTestimonial {
  id: string;
  name: string;
  isHighlight?: boolean; // ✅ Rendre optionnel avec ?
  // ...
}
```

---

### 🚨 **Erreur : "Argument of type 'X' is not assignable to parameter of type 'Y'"**

#### **Symptômes**
```typescript
Argument of type 'never[] | SomeType[]' is not assignable to parameter of type 'SetStateAction<ExpectedType[]>'
```

#### **Cause**
**Type union** ou **type incompatible** lors de l'assignation d'état React.

#### **✅ Solutions**

##### **Option 1 : Type Assertion**
```typescript
// ❌ Erreur
setTestimonials(testimonialsData || []);

// ✅ Correction avec assertion
setTestimonials((testimonialsData as PublicTestimonial[]) || []);
```

##### **Option 2 : Type Guard**
```typescript
// ✅ Correction avec vérification
if (testimonialsData && Array.isArray(testimonialsData)) {
  setTestimonials(testimonialsData);
} else {
  setTestimonials([]);
}
```

##### **Option 3 : Mapping avec Transformation**
```typescript
// ✅ Correction avec transformation
const transformedData = (testimonialsData || []).map(item => ({
  ...item,
  isHighlight: item.isHighlight ?? true // Valeur par défaut
}));
setTestimonials(transformedData);
```

---

## 🔍 **Diagnostic des Erreurs TypeScript**

### **🩺 Commandes de Diagnostic**

#### **1. Vérification TypeScript Complète**
```bash
# Frontend
npm run type-check
# ou
npx tsc --noEmit

# Backend
npm run build
```

#### **2. Vérification Spécifique d'un Fichier**
```bash
npx tsc --noEmit path/to/file.tsx
```

#### **3. Mode Watch pour Développement**
```bash
npx tsc --noEmit --watch
```

### **📊 Analyse des Types**

#### **Vérifier le Type d'une Variable**
```typescript
// Astuce de debug
const debugType: never = someVariable; // TypeScript affichera le type réel
```

#### **Inspecter les Types d'API**
```typescript
// Dans le code
type ApiResponse = Awaited<ReturnType<typeof SomeApi.method>>;
console.log('Type:', {} as ApiResponse); // Voir dans l'IDE
```

---

## 🛠️ **Patterns de Résolution**

### **🔄 Workflow de Résolution**

#### **1. Identifier l'Erreur**
```bash
# Lire attentivement le message d'erreur
# Noter le fichier et la ligne
# Comprendre le type attendu vs reçu
```

#### **2. Localiser la Source**
```bash
# Vérifier l'API backend
# Vérifier les types frontend
# Vérifier l'utilisation dans le composant
```

#### **3. Choisir la Solution**
```bash
# Corriger l'API (recommandé)
# Ajuster les types
# Transformer les données
```

#### **4. Tester la Correction**
```bash
npm run build
# ou
npm run type-check
```

### **🎯 Stratégies par Type d'Erreur**

#### **Propriétés Manquantes**
1. **Vérifier l'API** : La propriété est-elle retournée ?
2. **Vérifier le select** : La propriété est-elle sélectionnée ?
3. **Ajuster le type** : Rendre optionnel si nécessaire

#### **Types Incompatibles**
1. **Type assertion** : Pour les cas simples
2. **Type guards** : Pour les vérifications runtime
3. **Transformation** : Pour adapter les données

#### **Propriétés Dupliquées**
1. **Rechercher** : `grep -n "propertyName.*propertyName" file.tsx`
2. **Supprimer** : La première occurrence généralement
3. **Vérifier** : Que la logique reste correcte

---

## 🚀 **Bonnes Pratiques**

### **✅ Prévention des Erreurs**

#### **1. Cohérence API ↔ Frontend**
```typescript
// Backend - Service
select: {
  id: true,
  name: true,
  isHighlight: true, // ✅ Inclure toutes les propriétés nécessaires
}

// Frontend - Type
interface ApiResponse {
  id: string;
  name: string;
  isHighlight: boolean; // ✅ Correspondance exacte
}
```

#### **2. Types Stricts**
```typescript
// ❌ Éviter 'any'
const data: any = await api.getData();

// ✅ Types spécifiques
const data: ExpectedType = await api.getData();
```

#### **3. Validation Runtime**
```typescript
// ✅ Vérifier les données reçues
if (!data || typeof data !== 'object') {
  throw new Error('Invalid API response');
}
```

### **🔧 Outils Utiles**

#### **1. Extensions VSCode**
- **TypeScript Importer** : Auto-import des types
- **Error Lens** : Erreurs inline
- **TypeScript Hero** : Gestion des imports

#### **2. Configuration TypeScript Stricte**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

#### **3. Scripts Utiles**
```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

---

## 🎯 **Cas Spécifiques Résolus**

### **1. Propriété backgroundColor Dupliquée**
```typescript
// ❌ Problème
style={{
  backgroundColor: 'white',
  // ... autres propriétés
  backgroundColor: condition ? 'blue' : 'white' // DUPLIQUÉ !
}}

// ✅ Solution
style={{
  // ... autres propriétés
  backgroundColor: condition ? 'blue' : 'white' // UNE SEULE
}}
```

### **2. Propriété isHighlight Manquante**
```typescript
// ❌ Problème - API ne retourne pas isHighlight
select: {
  id: true,
  name: true,
  // isHighlight manquant
}

// ✅ Solution - Ajouter à l'API
select: {
  id: true,
  name: true,
  isHighlight: true, // AJOUTÉ
}
```

### **3. Type Union Incompatible**
```typescript
// ❌ Problème
setData(apiResponse || []); // Type incompatible

// ✅ Solution avec transformation
const transformedData = (apiResponse || []).map(item => ({
  ...item,
  missingProperty: defaultValue
}));
setData(transformedData);
```

---

## 📚 **Ressources**

### **🔗 Documentation**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)

### **🛠️ Outils de Debug**
- **TypeScript Playground** : [typescriptlang.org/play](https://www.typescriptlang.org/play)
- **Type Challenges** : [github.com/type-challenges/type-challenges](https://github.com/type-challenges/type-challenges)

---

## 🎉 **Résumé**

### **🔄 Workflow Standard**
```bash
1. Lire l'erreur attentivement
2. Identifier le type attendu vs reçu
3. Vérifier l'API backend
4. Ajuster les types frontend
5. Tester la compilation
```

### **⚡ Corrections Rapides**
| Erreur | Solution Rapide |
|--------|----------------|
| **Propriété dupliquée** | Supprimer la première occurrence |
| **Propriété manquante** | Ajouter au `select` backend |
| **Type incompatible** | Type assertion ou transformation |
| **Union type** | Type guard ou valeur par défaut |

**Suivez ce guide et vous résoudrez 99% des erreurs TypeScript ! 🎯✨**


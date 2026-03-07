'use client';

import type { User } from '@/types';

const STORAGE_KEY = 'auth_user';
const ENCRYPTION_KEY = 'tolotanana_secure_key_2024'; // En production, utilise une clé plus complexe et stockée côté serveur/variable d'env
const ENCRYPTION_VERSION_KEY = 'auth_encryption_version';
const CURRENT_ENCRYPTION_VERSION = 'v2'; // v2: clé stable (plus de clé basée sur le temps)

export type StoredUser = User & { token?: string };

// Cache pour éviter les déchiffrements répétés
let cachedUser: StoredUser | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5000; // 5 secondes

// Fonctions de chiffrement/déchiffrement simples (clé stable)
function generateKey(): string {
  return btoa(ENCRYPTION_KEY);
}

function encrypt(text: string): string {
  try {
    const key = generateKey();
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  } catch {
    return text; // Retourne le texte original en cas d'erreur
  }
}

function decrypt(encryptedText: string): string {
  try {
    const key = generateKey();
    const text = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return encryptedText; // Retourne le texte original en cas d'erreur
  }
}

// Chiffre tout l'objet utilisateur en un seul blob opaque
function encryptUserData(user: StoredUser): string {
  return encrypt(JSON.stringify(user));
}

// Déchiffre le blob opaque en objet utilisateur
function decryptUserData(blob: string): StoredUser {
  return JSON.parse(decrypt(blob));
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;

  // Vérifier le cache d'abord
  const now = Date.now();
  if (cachedUser && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedUser;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedUser = null;
      return null;
    }

    const version = localStorage.getItem(ENCRYPTION_VERSION_KEY);
    if (version === CURRENT_ENCRYPTION_VERSION) {
      // Données chiffrées (blob opaque) — déchiffrer
      const decrypted = decryptUserData(raw);
      cachedUser = decrypted;
      cacheTimestamp = now;
      return decrypted;
    }

    // Ancien format (JSON en clair) — migrer vers le blob chiffré
    const parsed = JSON.parse(raw) as StoredUser;
    const encrypted = encryptUserData(parsed);
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(ENCRYPTION_VERSION_KEY, CURRENT_ENCRYPTION_VERSION);
    cachedUser = parsed;
    cacheTimestamp = now;
    return parsed;
  } catch (error) {
    console.error('Erreur lors de la lecture des données utilisateur:', error);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ENCRYPTION_VERSION_KEY);
    cachedUser = null;
    return null;
  }
}


export function getStoredToken(): string | null {
  const u = getStoredUser();
  return u?.token ?? null;
}

function emitAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('auth:changed'));
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === 'undefined') return;

  // Chiffrer tout l'objet en un blob opaque
  const encrypted = encryptUserData(user);
  localStorage.setItem(STORAGE_KEY, encrypted);
  localStorage.setItem(ENCRYPTION_VERSION_KEY, CURRENT_ENCRYPTION_VERSION);

  cachedUser = user;
  cacheTimestamp = Date.now();

  emitAuthChanged();
}

export function setStoredToken(token: string): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, token });
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ENCRYPTION_VERSION_KEY);
  
  // Vider le cache
  cachedUser = null;
  cacheTimestamp = 0;
  
  emitAuthChanged();
}

// Force la migration des données existantes vers le format chiffré
export function migrateUserData(): void {
  if (typeof window === 'undefined') return;
  // Plus de migration : on laisse les données en clair (compatible avec l'ancien comportement)
}

// Force le rechargement du cache (utile pour les tests)
export function clearCache(): void {
  cachedUser = null;
  cacheTimestamp = 0;
}

function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(): number | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

export function isTokenExpired(): boolean {
  const expMs = getTokenExpiryMs();
  if (!expMs) return false;
  return Date.now() >= expMs;
}

let expiryIntervalId: number | null = null;

export function startSessionWatcher(onExpire: () => void, pollMs: number = 10000): void {
  if (typeof window === 'undefined') return;
  if (expiryIntervalId) {
    clearInterval(expiryIntervalId as unknown as number);
    expiryIntervalId = null;
  }
  const check = () => {
    if (isTokenExpired()) {
      clearStoredUser();
      onExpire();
    }
  };
  check();
  expiryIntervalId = setInterval(check, pollMs) as unknown as number;
}

export function stopSessionWatcher(): void {
  if (typeof window === 'undefined') return;
  if (expiryIntervalId) {
    clearInterval(expiryIntervalId as unknown as number);
    expiryIntervalId = null;
  }
}

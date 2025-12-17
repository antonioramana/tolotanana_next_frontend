'use client';

import type { User } from '@/types';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'auth_user';
// En production, utilise une clé plus complexe et stockée côté serveur/variable d'env
const ENCRYPTION_KEY = 'tolotanana_secure_key_2024_aes256_encryption';
const ENCRYPTION_VERSION_KEY = 'auth_encryption_version';
const CURRENT_ENCRYPTION_VERSION = 'v3'; // v3: AES-256 via CryptoJS

export type StoredUser = User & { token?: string };

// Cache pour éviter les déchiffrements répétés
let cachedUser: StoredUser | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5000; // 5 secondes

// Fonctions de chiffrement/déchiffrement AES-256 via CryptoJS
/**
 * Chiffre une chaîne de caractères en utilisant AES-256
 * @param text - Texte à chiffrer
 * @returns Texte chiffré en base64
 */
function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    return text; // Retourne le texte original en cas d'erreur
  }
}

/**
 * Déchiffre une chaîne de caractères chiffrée avec AES-256
 * @param encryptedText - Texte chiffré en base64
 * @returns Texte déchiffré
 */
function decrypt(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Si le déchiffrement échoue, decryptedText sera vide
    if (!decryptedText) {
      throw new Error('Échec du déchiffrement');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    return encryptedText; // Retourne le texte original en cas d'erreur
  }
}

/**
 * Chiffre toutes les données utilisateur avant stockage
 * @param user - Données utilisateur à chiffrer
 * @returns Chaîne JSON chiffrée
 */
function encryptUserData(user: StoredUser): string {
  try {
    const jsonString = JSON.stringify(user);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Erreur lors du chiffrement des données utilisateur:', error);
    throw error;
  }
}

/**
 * Déchiffre les données utilisateur depuis le stockage
 * @param encryptedData - Données chiffrées
 * @returns Données utilisateur déchiffrées
 */
function decryptUserData(encryptedData: string): StoredUser | null {
  try {
    const decryptedJson = decrypt(encryptedData);
    return JSON.parse(decryptedJson) as StoredUser;
  } catch (error) {
    console.error('Erreur lors du déchiffrement des données utilisateur:', error);
    return null;
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;

  // Vérifier le cache d'abord
  const now = Date.now();
  if (cachedUser && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedUser;
  }

  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    if (!encryptedData) {
      cachedUser = null;
      return null;
    }

    // Vérifier la version d'encryption
    const version = localStorage.getItem(ENCRYPTION_VERSION_KEY);
    
    let parsed: StoredUser | null = null;
    
    if (version === CURRENT_ENCRYPTION_VERSION) {
      // Données chiffrées avec AES-256
      parsed = decryptUserData(encryptedData);
      if (!parsed) {
        // Échec du déchiffrement, nettoyer le localStorage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ENCRYPTION_VERSION_KEY);
        cachedUser = null;
        return null;
      }
    } else {
      // Anciennes données non chiffrées ou avec ancien système (compatibilité)
      try {
        parsed = JSON.parse(encryptedData) as StoredUser;
        // Migrer automatiquement vers le nouveau format chiffré
        setStoredUser(parsed);
      } catch (parseError) {
        // Peut-être que c'est déjà chiffré mais sans version
        parsed = decryptUserData(encryptedData);
        if (!parsed) {
          console.error('Impossible de déchiffrer les données utilisateur');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(ENCRYPTION_VERSION_KEY);
          cachedUser = null;
          return null;
        }
        // Marquer comme chiffré pour les prochaines fois
        localStorage.setItem(ENCRYPTION_VERSION_KEY, CURRENT_ENCRYPTION_VERSION);
      }
    }

    if (!parsed) {
      cachedUser = null;
      return null;
    }

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

// Vérifie si les données sont chiffrées avec AES-256
function isEncryptedData(): boolean {
  const version = localStorage.getItem(ENCRYPTION_VERSION_KEY);
  return version === CURRENT_ENCRYPTION_VERSION;
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
  
  try {
    // Chiffrer toutes les données avant stockage
    const encryptedData = encryptUserData(user);
    localStorage.setItem(STORAGE_KEY, encryptedData);
    localStorage.setItem(ENCRYPTION_VERSION_KEY, CURRENT_ENCRYPTION_VERSION);

    cachedUser = user;
    cacheTimestamp = Date.now();

    emitAuthChanged();
  } catch (error) {
    console.error('Erreur lors du stockage des données utilisateur:', error);
    // En cas d'erreur, essayer de stocker sans chiffrement (fallback)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(ENCRYPTION_VERSION_KEY);
      cachedUser = user;
      cacheTimestamp = Date.now();
      emitAuthChanged();
    } catch (fallbackError) {
      console.error('Erreur lors du fallback de stockage:', fallbackError);
    }
  }
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

// Force la migration des données existantes vers le format chiffré AES-256
export function migrateUserData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    
    const version = localStorage.getItem(ENCRYPTION_VERSION_KEY);
    if (version === CURRENT_ENCRYPTION_VERSION) {
      // Déjà migré
      return;
    }
    
    // Essayer de parser comme JSON (ancien format)
    try {
      const user = JSON.parse(raw) as StoredUser;
      // Re-stocker avec chiffrement AES-256
      setStoredUser(user);
      console.log('Migration des données utilisateur vers AES-256 réussie');
    } catch {
      // Peut-être déjà chiffré mais sans version
      const user = decryptUserData(raw);
      if (user) {
        setStoredUser(user);
        console.log('Migration des données utilisateur vers AES-256 réussie');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
  }
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

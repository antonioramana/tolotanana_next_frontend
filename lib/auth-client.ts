'use client';

import type { User } from '@/types';

const STORAGE_KEY = 'auth_user';

export type StoredUser = User & { token?: string };

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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
  emitAuthChanged();
}



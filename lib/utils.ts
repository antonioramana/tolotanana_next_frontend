import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const safe = typeof numAmount === 'number' && isFinite(numAmount) ? numAmount : 0;
  const result = `${new Intl.NumberFormat('fr-FR').format(safe)} Ar`;
  return result;
}
import type { Role } from '@metaverse/moderation';
import { canSpeak, canModerate } from '@metaverse/moderation';

export type { Role };

/**
 * Check if role can speak
 */
export function canUserSpeak(role: Role): boolean {
  return canSpeak(role);
}

/**
 * Check if role can moderate
 */
export function canUserModerate(role: Role): boolean {
  return canModerate(role);
}

/**
 * Ensure consent for screenshare or recording
 * @param kind - Type of consent needed
 * @returns Promise<boolean> - true if consent given, false otherwise
 */
export async function ensureConsent(kind: 'screenshare' | 'recording'): Promise<boolean> {
  const key = `consent:${kind}`;
  const stored = localStorage.getItem(key);

  if (stored === '1') {
    return true; // Already consented
  }

  // Show consent dialog
  const message =
    kind === 'screenshare'
      ? 'Möchten Sie Ihren Bildschirm teilen?'
      : 'Möchten Sie diese Sitzung aufzeichnen?';

  const ok = window.confirm(message);

  if (ok) {
    localStorage.setItem(key, '1');
  }

  return ok;
}

/**
 * Clear consent for a specific kind
 */
export function clearConsent(kind: 'screenshare' | 'recording'): void {
  const key = `consent:${kind}`;
  localStorage.removeItem(key);
}

/**
 * Check if consent was given
 */
export function hasConsent(kind: 'screenshare' | 'recording'): boolean {
  const key = `consent:${kind}`;
  return localStorage.getItem(key) === '1';
}

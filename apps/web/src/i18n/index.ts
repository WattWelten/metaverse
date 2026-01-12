type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = {};

// Import locales
import de from './locales/de.json';
import en from './locales/en.json';

dictionaries.de = de;
dictionaries.en = en;

let currentLang: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_I18N_DEFAULT) ||
  localStorage.getItem('lang') ||
  'de';

/**
 * Translate a key
 */
export function t(key: string): string {
  return dictionaries[currentLang]?.[key] ?? dictionaries.de?.[key] ?? key;
}

/**
 * Set language
 */
export function setLang(lang: 'de' | 'en'): void {
  currentLang = lang;
  localStorage.setItem('lang', lang);
}

/**
 * Get current language
 */
export function getLang(): 'de' | 'en' {
  return (currentLang as 'de' | 'en') || 'de';
}

/**
 * Initialize language from localStorage
 */
export function initLang(): void {
  const saved = localStorage.getItem('lang') as 'de' | 'en' | null;
  if (saved && (saved === 'de' || saved === 'en')) {
    currentLang = saved;
  }
}

// Initialize on import (only in browser)
// Note: initLang() is called automatically here, no need to call it manually in App.tsx
if (typeof window !== 'undefined') {
  initLang();
}

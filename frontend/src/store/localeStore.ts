import { create } from 'zustand';
import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from '../i18n/translations';

const STORAGE_KEY = 'postguy-locale';

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];

  for (const raw of candidates) {
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (lower.startsWith('pt')) return 'pt-BR';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) return stored as Locale;
  return detectBrowserLocale();
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale: Locale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
    set({ locale });
  },
}));

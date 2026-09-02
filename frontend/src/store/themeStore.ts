import { create } from 'zustand';

export type Theme = 'green' | 'blue' | 'light';

const THEMES: Theme[] = ['green', 'blue', 'light'];
const STORAGE_KEY = 'postguy-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'green';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.includes(stored as Theme)) return stored as Theme;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'green';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialTheme = getInitialTheme();
if (typeof window !== 'undefined') {
  applyTheme(initialTheme);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));

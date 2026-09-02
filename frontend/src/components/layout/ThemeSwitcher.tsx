import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useThemeStore, Theme } from '../../store/themeStore';
import { useT } from '../../i18n/useT';

const SWATCHES: Record<Theme, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  light: '#ffffff',
};

export function ThemeSwitcher() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [open, setOpen] = useState(false);
  const t = useT();

  const options: { value: Theme; label: string }[] = [
    { value: 'green', label: t('theme.green') },
    { value: 'blue', label: t('theme.blue') },
    { value: 'light', label: t('theme.light') },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-panel-light text-text-muted hover:text-text-primary transition-colors"
        title={t('app.theme')}
      >
        <Palette size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-panel-light border border-border rounded shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-panel transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full border border-border-light flex-shrink-0"
                  style={{ backgroundColor: SWATCHES[opt.value] }}
                />
                <span className="flex-1 text-left">{opt.label}</span>
                {theme === opt.value && <Check size={12} className="text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

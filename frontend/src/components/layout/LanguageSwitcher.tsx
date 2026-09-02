import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLocaleStore } from '../../store/localeStore';
import { Locale, SUPPORTED_LOCALES } from '../../i18n/translations';
import { useT } from '../../i18n/useT';

const LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (BR)',
  es: 'Español',
};

export function LanguageSwitcher() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-panel-light text-text-muted hover:text-text-primary transition-colors"
        title={t('app.language')}
      >
        <Languages size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-panel-light border border-border rounded shadow-lg py-1">
            {SUPPORTED_LOCALES.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setLocale(value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-panel transition-colors"
              >
                <span className="flex-1 text-left">{LABELS[value]}</span>
                {locale === value && <Check size={12} className="text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

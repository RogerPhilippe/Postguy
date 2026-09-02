import { useCallback } from 'react';
import { useLocaleStore } from '../store/localeStore';
import { DEFAULT_LOCALE, translations } from './translations';

type Vars = Record<string, string | number>;

export function useT() {
  const locale = useLocaleStore((state) => state.locale);

  return useCallback(
    (key: string, vars?: Vars) => {
      const template = translations[locale][key] ?? translations[DEFAULT_LOCALE][key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (str, [name, value]) => str.replace(`{{${name}}}`, String(value)),
        template
      );
    },
    [locale]
  );
}

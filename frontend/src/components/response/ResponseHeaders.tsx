import React from 'react';
import { useT } from '../../i18n/useT';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const entries = Object.entries(headers);
  const t = useT();

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
        {t('response.noHeaders')}
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2 text-text-muted font-medium w-1/3">{t('response.name')}</th>
            <th className="text-left px-4 py-2 text-text-muted font-medium">{t('response.value')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {entries.map(([key, value]) => (
            <tr key={key} className="hover:bg-panel-light transition-colors group">
              <td className="px-4 py-2 font-mono text-accent font-medium align-top w-1/3">
                {key}
              </td>
              <td className="px-4 py-2 font-mono text-text-primary break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

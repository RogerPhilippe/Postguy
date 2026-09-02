import React from 'react';
import { ResponseData } from '../../types/response';
import { formatBytes, formatTime } from '../../utils/formatter';
import { useT } from '../../i18n/useT';

interface ResponseMetaProps {
  response: ResponseData;
}

function getStatusColor(status: number): string {
  if (status >= 500) return 'text-red-400 bg-red-400/10 border-red-400/30';
  if (status >= 400) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
  if (status >= 300) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
}

export function ResponseMeta({ response }: ResponseMetaProps) {
  const statusColor = getStatusColor(response.status);
  const t = useT();

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
      <span className={`px-2.5 py-1 rounded text-sm font-mono font-semibold border ${statusColor}`}>
        {response.status} {response.statusText}
      </span>
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <span className="text-text-muted">{t('response.time')}</span>
        <span className="font-mono text-text-primary">{formatTime(response.time)}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <span className="text-text-muted">{t('response.size')}</span>
        <span className="font-mono text-text-primary">{formatBytes(response.size)}</span>
      </div>
    </div>
  );
}

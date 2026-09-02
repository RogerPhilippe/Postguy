import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { ConsoleEntry } from '../../types/response';
import { formatDate, formatTime } from '../../utils/formatter';
import { HttpMethod } from '../../types/request';
import { useT } from '../../i18n/useT';

const LEVEL_LABEL_KEY = {
  info: 'console.filterInfo',
  error: 'console.filterError',
  warning: 'console.filterWarning',
  success: 'console.filterSuccess',
} as const;

const LEVEL_COLORS = {
  info: 'text-blue-400 bg-blue-400/10',
  error: 'text-red-400 bg-red-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  success: 'text-emerald-400 bg-emerald-400/10',
};

const LEVEL_BORDER = {
  info: 'border-l-blue-400/50',
  error: 'border-l-red-400/50',
  warning: 'border-l-yellow-400/50',
  success: 'border-l-emerald-400/50',
};

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-orange-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

interface ConsoleEntryItemProps {
  entry: ConsoleEntry;
}

export function ConsoleEntryItem({ entry }: ConsoleEntryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = Boolean(entry.details);
  const t = useT();

  return (
    <div
      className={`border-l-2 ${LEVEL_BORDER[entry.level]} hover:bg-panel-light/50 transition-colors`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 text-xs ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        {hasDetails ? (
          <span className="text-text-muted flex-shrink-0">
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span className="w-[10px] flex-shrink-0" />
        )}

        {/* Timestamp */}
        <span className="text-text-muted font-mono flex-shrink-0">
          {formatDate(entry.timestamp)}
        </span>

        {/* Level badge */}
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase flex-shrink-0 ${LEVEL_COLORS[entry.level]}`}>
          {t(LEVEL_LABEL_KEY[entry.level])}
        </span>

        {/* Method */}
        {entry.method && (
          <span className={`font-mono font-semibold flex-shrink-0 ${METHOD_COLORS[entry.method as HttpMethod] || 'text-text-secondary'}`}>
            {entry.method}
          </span>
        )}

        {/* URL */}
        {entry.url && (
          <span className="font-mono text-text-secondary truncate" title={entry.url}>
            {entry.url}
          </span>
        )}

        {/* Message */}
        {!entry.url && (
          <span className="text-text-primary truncate">{entry.message}</span>
        )}

        {/* Status */}
        {entry.status !== undefined && (
          <span className={`ml-auto flex-shrink-0 font-mono ${
            entry.status >= 500
              ? 'text-red-400'
              : entry.status >= 400
              ? 'text-orange-400'
              : entry.status >= 300
              ? 'text-yellow-400'
              : 'text-emerald-400'
          }`}>
            {entry.status}
          </span>
        )}

        {/* Time */}
        {entry.time !== undefined && (
          <span className="text-text-muted flex-shrink-0 font-mono">
            {formatTime(entry.time)}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && entry.details && (
        <div className="px-8 pb-2">
          <pre className="text-xs font-mono text-text-secondary bg-app-bg rounded p-2 overflow-auto whitespace-pre-wrap break-all">
            {entry.details}
          </pre>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Send, Copy, Check, Loader2 } from 'lucide-react';
import { useTabsStore } from '../../store/tabsStore';
import { useSendRequest } from '../../hooks/useRequest';
import { HttpMethod } from '../../types/request';
import { toCurl } from '../../utils/curlExporter';
import { parseUrlParams } from '../../utils/url';
import { useT } from '../../i18n/useT';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-orange-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

interface RequestBarProps {
  tabId: string;
}

export function RequestBar({ tabId }: RequestBarProps) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const { send, isLoading } = useSendRequest(tabId);
  const [copied, setCopied] = useState(false);
  const t = useT();

  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTabRequest(tabId, { method: e.target.value as HttpMethod });
  }, [tabId, updateTabRequest]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const newParams = parseUrlParams(url);

    // Merge with existing params that have keys not in URL
    const existingParams = tab?.request.params || [];
    const existingNonUrlParams = existingParams.filter(
      (p) => !newParams.some((np) => np.key === p.key)
    );

    updateTabRequest(tabId, {
      url,
      params: [...newParams, ...existingNonUrlParams],
    });
  }, [tabId, updateTabRequest, tab?.request.params]);

  const handleCopyCurl = useCallback(() => {
    if (!tab) return;
    const curl = toCurl(tab.request);
    navigator.clipboard.writeText(curl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tab]);

  if (!tab) return null;

  const methodColor = METHOD_COLORS[tab.request.method];

  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-app-bg">
      {/* Method selector */}
      <div className="relative">
        <select
          value={tab.request.method}
          onChange={handleMethodChange}
          className={`appearance-none bg-panel border border-border rounded px-3 py-2 text-sm font-mono font-semibold cursor-pointer focus:outline-none focus:border-accent transition-colors pr-6 ${methodColor}`}
          style={{ minWidth: '95px' }}
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method} className={METHOD_COLORS[method]}>
              {method}
            </option>
          ))}
        </select>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M0 0l5 6 5-6z" />
          </svg>
        </div>
      </div>

      {/* URL input */}
      <input
        type="text"
        value={tab.request.url}
        onChange={handleUrlChange}
        placeholder={t('request.urlPlaceholder')}
        className="flex-1 bg-panel border border-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            send();
          }
        }}
      />

      {/* Copy as cURL */}
      <button
        onClick={handleCopyCurl}
        className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-text-secondary hover:text-text-primary bg-panel border border-border rounded hover:bg-panel-light transition-colors"
        title={t('request.copyAsCurl')}
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        <span>{t('request.curl')}</span>
      </button>

      {/* Send button */}
      <button
        onClick={send}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
        title={t('request.sendRequest')}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>{t('request.sending')}</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>{t('request.send')}</span>
          </>
        )}
      </button>
    </div>
  );
}

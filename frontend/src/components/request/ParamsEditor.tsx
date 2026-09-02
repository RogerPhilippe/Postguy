import React, { useCallback } from 'react';
import { useTabsStore } from '../../store/tabsStore';
import { KeyValuePair } from '../../types/request';
import { KeyValueTable } from './KeyValueTable';
import { useT } from '../../i18n/useT';

interface ParamsEditorProps {
  tabId: string;
}

function buildUrlWithParams(baseUrl: string, params: KeyValuePair[]): string {
  const enabledParams = params.filter((p) => p.enabled && p.key.trim());
  if (enabledParams.length === 0) {
    // Remove existing query string
    try {
      const parsed = new URL(baseUrl);
      parsed.search = '';
      return parsed.toString();
    } catch {
      return baseUrl.split('?')[0];
    }
  }

  try {
    const parsed = new URL(baseUrl);
    parsed.search = '';
    for (const param of enabledParams) {
      parsed.searchParams.set(param.key.trim(), param.value);
    }
    return parsed.toString();
  } catch {
    // Not a valid URL, manually append
    const base = baseUrl.split('?')[0];
    const qs = enabledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
  }
}

export function ParamsEditor({ tabId }: ParamsEditorProps) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const t = useT();

  const handleParamsChange = useCallback((newParams: KeyValuePair[]) => {
    const currentUrl = tab?.request.url || '';
    const newUrl = buildUrlWithParams(currentUrl, newParams);
    updateTabRequest(tabId, { params: newParams, url: newUrl });
  }, [tab?.request.url, tabId, updateTabRequest]);

  if (!tab) return null;

  return (
    <div className="h-full overflow-auto">
      <KeyValueTable
        pairs={tab.request.params}
        onChange={handleParamsChange}
        keyPlaceholder={t('request.parameterName')}
        valuePlaceholder={t('request.value')}
        addLabel={t('request.addParameter')}
      />
    </div>
  );
}

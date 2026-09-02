import React, { useCallback } from 'react';
import { useTabsStore } from '../../store/tabsStore';
import { KeyValuePair } from '../../types/request';
import { KeyValueTable } from './KeyValueTable';
import { useT } from '../../i18n/useT';

interface HeadersEditorProps {
  tabId: string;
}

export function HeadersEditor({ tabId }: HeadersEditorProps) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const t = useT();

  const handleHeadersChange = useCallback((newHeaders: KeyValuePair[]) => {
    updateTabRequest(tabId, { headers: newHeaders });
  }, [tabId, updateTabRequest]);

  if (!tab) return null;

  return (
    <div className="h-full overflow-auto">
      <KeyValueTable
        pairs={tab.request.headers}
        onChange={handleHeadersChange}
        keyPlaceholder={t('request.headerName')}
        valuePlaceholder={t('request.value')}
        addLabel={t('request.addHeader')}
      />
    </div>
  );
}

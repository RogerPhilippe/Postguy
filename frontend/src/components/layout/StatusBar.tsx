import React from 'react';
import { useTabsStore } from '../../store/tabsStore';
import { Circle } from 'lucide-react';
import { useT } from '../../i18n/useT';

export function StatusBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const response = activeTab?.response;
  const isLoading = activeTab?.isLoading;
  const t = useT();

  return (
    <div className="h-6 bg-accent/20 border-t border-border flex items-center px-4 gap-4 text-xs text-text-secondary">
      <div className="flex items-center gap-1.5">
        <Circle
          size={8}
          className={isLoading ? 'text-yellow-400 animate-pulse fill-current' : 'text-emerald-400 fill-current'}
        />
        <span>
          {isLoading
            ? t('response.sendingRequest')
            : response
            ? `${response.status} ${response.statusText}`
            : t('status.ready')}
        </span>
      </div>
      {response && !isLoading && (
        <>
          <span className="text-border">|</span>
          <span>{response.time}ms</span>
          <span className="text-border">|</span>
          <span>{(response.size / 1024).toFixed(2)} KB</span>
        </>
      )}
      <div className="ml-auto text-text-muted">
        Postguy v{import.meta.env.VITE_APP_VERSION ?? 'dev'}
      </div>
    </div>
  );
}

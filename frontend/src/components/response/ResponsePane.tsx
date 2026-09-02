import React, { useState } from 'react';
import { useTabsStore } from '../../store/tabsStore';
import { ResponseMeta } from './ResponseMeta';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';
import { Inbox, Loader2 } from 'lucide-react';
import { useT } from '../../i18n/useT';

interface ResponsePaneProps {
  tabId: string;
}

type ResponseTab = 'body' | 'headers';

export function ResponsePane({ tabId }: ResponsePaneProps) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const [activeTab, setActiveTab] = useState<ResponseTab>('body');
  const t = useT();

  if (!tab) return null;

  if (tab.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
        <Loader2 size={32} className="animate-spin text-accent" />
        <p className="text-sm">{t('response.sendingRequest')}</p>
      </div>
    );
  }

  if (!tab.response) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
        <Inbox size={40} className="opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary">{t('response.noResponseTitle')}</p>
          <p className="text-xs mt-1">{t('response.noResponseSubtitle')}</p>
        </div>
      </div>
    );
  }

  const { response } = tab;
  const TAB_LABELS: Record<ResponseTab, string> = {
    body: t('request.body'),
    headers: t('request.headers'),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ResponseMeta response={response} />

      {/* Tabs */}
      <div className="flex items-center border-b border-border px-4">
        {(['body', 'headers'] as ResponseTab[]).map((tabName) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tabName
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {TAB_LABELS[tabName]}
            {tabName === 'headers' && (
              <span className="ml-1.5 text-text-muted">
                ({Object.keys(response.headers).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' && (
          <ResponseBody body={response.body} headers={response.headers} />
        )}
        {activeTab === 'headers' && (
          <ResponseHeaders headers={response.headers} />
        )}
      </div>
    </div>
  );
}

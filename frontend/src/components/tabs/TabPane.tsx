import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { RequestBar } from '../request/RequestBar';
import { ParamsEditor } from '../request/ParamsEditor';
import { HeadersEditor } from '../request/HeadersEditor';
import { BodyEditor } from '../request/BodyEditor';
import { ResponsePane } from '../response/ResponsePane';
import { useTabsStore } from '../../store/tabsStore';
import { useT } from '../../i18n/useT';

type RequestTab = 'params' | 'headers' | 'body';

interface TabPaneProps {
  tabId: string;
}

export function TabPane({ tabId }: TabPaneProps) {
  const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>('params');
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const t = useT();

  if (!tab) return null;

  const requestTabItems: { value: RequestTab; label: string; count?: number }[] = [
    {
      value: 'params',
      label: t('request.queryParams'),
      count: tab.request.params.filter((p) => p.enabled && p.key).length || undefined,
    },
    {
      value: 'headers',
      label: t('request.headers'),
      count: tab.request.headers.filter((h) => h.enabled && h.key).length || undefined,
    },
    {
      value: 'body',
      label: t('request.body'),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Request bar */}
      <RequestBar tabId={tabId} />

      {/* Main split panel */}
      <PanelGroup direction="vertical" className="flex-1 min-h-0">
        {/* Request config panel */}
        <Panel defaultSize={35} minSize={20}>
          <div className="flex flex-col h-full overflow-hidden bg-app-bg">
            {/* Request tabs */}
            <div className="flex items-center border-b border-border px-4 flex-shrink-0">
              {requestTabItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveRequestTab(item.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                    activeRequestTab === item.value
                      ? 'border-accent text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.label}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-accent/20 text-accent rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto">
              {activeRequestTab === 'params' && <ParamsEditor tabId={tabId} />}
              {activeRequestTab === 'headers' && <HeadersEditor tabId={tabId} />}
              {activeRequestTab === 'body' && <BodyEditor tabId={tabId} />}
            </div>
          </div>
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle className="h-1 bg-border hover:bg-accent transition-colors cursor-row-resize group">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-8 h-0.5 rounded bg-border-light group-hover:bg-accent transition-colors" />
          </div>
        </PanelResizeHandle>

        {/* Response panel */}
        <Panel defaultSize={65} minSize={20}>
          <div className="h-full bg-app-bg overflow-hidden">
            <ResponsePane tabId={tabId} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

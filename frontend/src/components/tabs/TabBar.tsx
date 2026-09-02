import React from 'react';
import { Plus, X } from 'lucide-react';
import { useTabsStore } from '../../store/tabsStore';
import { Tab } from '../../types/tab';
import { HttpMethod } from '../../types/request';
import { useT } from '../../i18n/useT';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-orange-400',
  DELETE: 'text-red-400',
  PATCH: 'text-purple-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

function TabItem({ tab, isActive, onSelect, onClose }: TabItemProps) {
  const t = useT();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <button
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2 text-sm border-r border-border min-w-0 max-w-[200px] flex-shrink-0 transition-colors relative ${
        isActive
          ? 'bg-app-bg text-text-primary border-b-2 border-b-accent'
          : 'bg-panel text-text-secondary hover:bg-panel-light hover:text-text-primary'
      }`}
      title={tab.request.url || t('tabs.newRequest')}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
      )}

      <span className={`text-xs font-mono font-semibold flex-shrink-0 ${METHOD_COLORS[tab.request.method]}`}>
        {tab.request.method.slice(0, 3)}
      </span>
      <span className="truncate text-xs flex-1 min-w-0">
        {tab.label}
      </span>
      {tab.isLoading && (
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
      )}
      <span
        role="button"
        onClick={handleClose}
        className={`flex-shrink-0 p-0.5 rounded transition-opacity ${
          isActive
            ? 'opacity-60 hover:opacity-100 hover:bg-border'
            : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-border'
        }`}
        aria-label={t('tabs.closeTab')}
      >
        <X size={12} />
      </span>
    </button>
  );
}

export function TabBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const addTab = useTabsStore((state) => state.addTab);
  const closeTab = useTabsStore((state) => state.closeTab);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const t = useT();

  return (
    <div className="flex items-stretch border-b border-border bg-panel overflow-x-auto">
      <button
        onClick={addTab}
        className="flex-shrink-0 px-3 py-2 text-text-muted hover:text-text-primary hover:bg-panel-light transition-colors border-r border-border"
        title={t('tabs.newTab')}
        aria-label={t('tabs.newTab')}
      >
        <Plus size={14} />
      </button>
      <div className="flex items-stretch flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}

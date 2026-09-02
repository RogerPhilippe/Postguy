import React, { useRef, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { TabBar } from './components/tabs/TabBar';
import { TabPane } from './components/tabs/TabPane';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { ConsolePanel } from './components/console/ConsolePanel';
import { ThemeSwitcher } from './components/layout/ThemeSwitcher';
import { LanguageSwitcher } from './components/layout/LanguageSwitcher';
import { EasterEggDialog } from './components/layout/EasterEggDialog';
import { useTabsStore } from './store/tabsStore';
import { useT } from './i18n/useT';

const LONG_PRESS_MS = 5000;

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const t = useT();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => {
    pressTimer.current = setTimeout(() => setShowEasterEgg(true), LONG_PRESS_MS);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-app-bg text-text-primary overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="flex items-center px-4 py-2.5 border-b border-border bg-panel flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center select-none"
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
          >
            <img src="/icon.svg" alt="Postguy" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary leading-none">Postguy</h1>
            <p className="text-[10px] text-text-muted leading-none mt-0.5">{t('app.subtitle')}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Tab bar */}
          <TabBar />

          {/* Tab content + console */}
          <PanelGroup direction="vertical" className="flex-1 min-h-0">
            {/* Tab pane */}
            <Panel defaultSize={75} minSize={30}>
              <TabPane tabId={activeTabId} />
            </Panel>

            {/* Resize handle */}
            <PanelResizeHandle className="h-1 bg-border hover:bg-accent/50 transition-colors cursor-row-resize" />

            {/* Console panel */}
            <Panel defaultSize={25} minSize={10} maxSize={60}>
              <ConsolePanel />
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />

      <EasterEggDialog open={showEasterEgg} onClose={() => setShowEasterEgg(false)} />
    </div>
  );
}

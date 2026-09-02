import React, { useState } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useConsoleStore } from '../../store/consoleStore';
import { ConsoleEntryItem } from './ConsoleEntryItem';
import { LogLevel } from '../../types/response';
import { useT } from '../../i18n/useT';

type FilterLevel = 'all' | LogLevel;

export function ConsolePanel() {
  const entries = useConsoleStore((state) => state.entries);
  const clearConsole = useConsoleStore((state) => state.clearConsole);
  const [filter, setFilter] = useState<FilterLevel>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useT();

  const FILTER_BUTTONS: { value: FilterLevel; label: string }[] = [
    { value: 'all', label: t('console.filterAll') },
    { value: 'info', label: t('console.filterInfo') },
    { value: 'success', label: t('console.filterSuccess') },
    { value: 'warning', label: t('console.filterWarning') },
    { value: 'error', label: t('console.filterError') },
  ];

  const filteredEntries = filter === 'all' ? entries : entries.filter((e) => e.level === filter);

  const errorCount = entries.filter((e) => e.level === 'error').length;
  const warningCount = entries.filter((e) => e.level === 'warning').length;

  return (
    <div className="flex flex-col h-full border-t border-border bg-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Terminal size={13} />
          <span className="text-xs font-medium">{t('console.title')}</span>
          {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {!isCollapsed && (
          <>
            {/* Entry counts */}
            <div className="flex items-center gap-2 ml-2">
              {errorCount > 0 && (
                <span className="text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                  {errorCount} {t(errorCount !== 1 ? 'console.errors' : 'console.error')}
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                  {warningCount} {t(warningCount !== 1 ? 'console.warnings' : 'console.warning')}
                </span>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-0.5 ml-auto">
              {FILTER_BUTTONS.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    filter === btn.value
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-panel-light'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Clear button */}
            {entries.length > 0 && (
              <button
                onClick={clearConsole}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-text-muted hover:text-red-400 hover:bg-panel-light rounded transition-colors"
                title={t('console.clearConsole')}
              >
                <Trash2 size={11} />
                <span>{t('console.clear')}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Entries */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted">
              <Terminal size={20} className="opacity-30" />
              <p className="text-xs">
                {entries.length === 0
                  ? t('console.empty')
                  : t('console.noFilterEntries', {
                      filter: (FILTER_BUTTONS.find((b) => b.value === filter)?.label ?? filter).toLowerCase(),
                    })}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredEntries.map((entry) => (
                <ConsoleEntryItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

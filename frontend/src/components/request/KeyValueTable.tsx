import React, { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from '../../types/request';
import { v4 as uuidv4 } from 'uuid';
import { useT } from '../../i18n/useT';

interface KeyValueTableProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}

export function KeyValueTable({
  pairs,
  onChange,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
}: KeyValueTableProps) {
  const t = useT();
  const resolvedKeyPlaceholder = keyPlaceholder ?? t('request.key');
  const resolvedValuePlaceholder = valuePlaceholder ?? t('request.value');
  const resolvedAddLabel = addLabel ?? t('request.addParameter');
  const handleAdd = useCallback(() => {
    onChange([...pairs, { id: uuidv4(), key: '', value: '', enabled: true }]);
  }, [pairs, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(pairs.filter((p) => p.id !== id));
  }, [pairs, onChange]);

  const handleToggle = useCallback((id: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }, [pairs, onChange]);

  const handleKeyChange = useCallback((id: string, key: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, key } : p)));
  }, [pairs, onChange]);

  const handleValueChange = useCallback((id: string, value: string) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, value } : p)));
  }, [pairs, onChange]);

  return (
    <div className="flex flex-col gap-0">
      {pairs.length > 0 && (
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-0 border-b border-border">
          <div className="px-2 py-1.5 text-xs text-text-muted" />
          <div className="px-3 py-1.5 text-xs text-text-muted font-medium border-l border-border">
            {t('request.key')}
          </div>
          <div className="px-3 py-1.5 text-xs text-text-muted font-medium border-l border-border">
            {t('request.value')}
          </div>
          <div className="px-2 py-1.5" />
        </div>
      )}

      {pairs.map((pair) => (
        <div
          key={pair.id}
          className={`grid grid-cols-[auto_1fr_1fr_auto] gap-0 border-b border-border/50 group transition-colors ${
            pair.enabled ? '' : 'opacity-50'
          }`}
        >
          <div className="flex items-center px-2 border-r border-border/50">
            <input
              type="checkbox"
              checked={pair.enabled}
              onChange={() => handleToggle(pair.id)}
              className="w-3 h-3 accent-accent cursor-pointer"
              aria-label={t('request.enableDisable')}
            />
          </div>
          <input
            type="text"
            value={pair.key}
            onChange={(e) => handleKeyChange(pair.id, e.target.value)}
            placeholder={resolvedKeyPlaceholder}
            className="px-3 py-1.5 text-xs font-mono bg-transparent text-text-primary placeholder-text-muted focus:outline-none focus:bg-panel-light/50 transition-colors border-r border-border/50"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => handleValueChange(pair.id, e.target.value)}
            placeholder={resolvedValuePlaceholder}
            className="px-3 py-1.5 text-xs font-mono bg-transparent text-text-primary placeholder-text-muted focus:outline-none focus:bg-panel-light/50 transition-colors"
          />
          <div className="flex items-center px-2 border-l border-border/50">
            <button
              onClick={() => handleRemove(pair.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-muted hover:text-red-400 transition-all"
              aria-label={t('request.remove')}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-panel-light transition-colors"
      >
        <Plus size={12} />
        <span>{resolvedAddLabel}</span>
      </button>
    </div>
  );
}

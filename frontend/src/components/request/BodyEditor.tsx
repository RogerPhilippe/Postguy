import React, { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTabsStore } from '../../store/tabsStore';
import { BodyType, KeyValuePair } from '../../types/request';
import { KeyValueTable } from './KeyValueTable';
import { formatJson } from '../../utils/formatter';
import { Wand2 } from 'lucide-react';
import { useT } from '../../i18n/useT';
import { useThemeStore } from '../../store/themeStore';

const editorTheme: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, Fira Code, monospace',
};

interface BodyEditorProps {
  tabId: string;
}

function parseBodyPairs(body: string): KeyValuePair[] {
  try {
    return JSON.parse(body || '[]');
  } catch {
    return [];
  }
}

export function BodyEditor({ tabId }: BodyEditorProps) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const updateTabRequest = useTabsStore((state) => state.updateTabRequest);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const t = useT();
  const cmTheme = useThemeStore((state) => state.theme) === 'light' ? 'light' : 'dark';

  const BODY_TYPES: { value: BodyType; label: string }[] = [
    { value: 'none', label: t('request.bodyTypeNone') },
    { value: 'json', label: t('request.bodyTypeJson') },
    { value: 'form-data', label: t('request.bodyTypeFormData') },
    { value: 'x-www-form-urlencoded', label: t('request.bodyTypeUrlEncoded') },
    { value: 'raw', label: t('request.bodyTypeRaw') },
  ];

  const handleBodyTypeChange = useCallback((bodyType: BodyType) => {
    let body = '';
    if (bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') {
      body = '[]';
    }
    updateTabRequest(tabId, { bodyType, body });
    setJsonError(null);
  }, [tabId, updateTabRequest]);

  const handleJsonChange = useCallback((value: string) => {
    updateTabRequest(tabId, { body: value });
    if (value.trim() === '') {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : t('request.invalidJson'));
    }
  }, [tabId, updateTabRequest, t]);

  const handleFormatJson = useCallback(() => {
    if (!tab) return;
    const formatted = formatJson(tab.request.body);
    updateTabRequest(tabId, { body: formatted });
    setJsonError(null);
  }, [tab, tabId, updateTabRequest]);

  const handleRawChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTabRequest(tabId, { body: e.target.value });
  }, [tabId, updateTabRequest]);

  const handlePairsChange = useCallback((pairs: KeyValuePair[]) => {
    updateTabRequest(tabId, { body: JSON.stringify(pairs) });
  }, [tabId, updateTabRequest]);

  if (!tab) return null;

  const { bodyType, body } = tab.request;

  return (
    <div className="flex flex-col h-full">
      {/* Body type selector */}
      <div className="flex items-center gap-0.5 px-3 pt-2 pb-1 border-b border-border/50">
        {BODY_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => handleBodyTypeChange(type.value)}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              bodyType === type.value
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-panel-light'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-auto">
        {bodyType === 'none' && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            {t('request.noBody')}
          </div>
        )}

        {bodyType === 'json' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-1 bg-panel/50 border-b border-border/50">
              {jsonError ? (
                <span className="text-xs text-red-400 font-mono">{jsonError}</span>
              ) : (
                <span className="text-xs text-text-muted">application/json</span>
              )}
              <button
                onClick={handleFormatJson}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
                title={t('request.formatJson')}
              >
                <Wand2 size={11} />
                <span>{t('request.formatJson')}</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={body}
                onChange={handleJsonChange}
                extensions={[json()]}
                theme={cmTheme}
                style={editorTheme}
                className="h-full text-xs"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  bracketMatching: true,
                  autocompletion: true,
                }}
              />
            </div>
          </div>
        )}

        {(bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') && (
          <KeyValueTable
            pairs={parseBodyPairs(body)}
            onChange={handlePairsChange}
            keyPlaceholder={t('request.fieldName')}
            valuePlaceholder={t('request.value')}
            addLabel={bodyType === 'form-data' ? t('request.addField') : t('request.addParameter')}
          />
        )}

        {bodyType === 'raw' && (
          <div className="h-full flex flex-col">
            <div className="px-3 py-1 bg-panel/50 border-b border-border/50">
              <span className="text-xs text-text-muted">text/plain</span>
            </div>
            <textarea
              value={body}
              onChange={handleRawChange}
              placeholder={t('request.rawPlaceholder')}
              className="flex-1 w-full bg-transparent text-text-primary text-xs font-mono p-3 resize-none focus:outline-none placeholder-text-muted"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

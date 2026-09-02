import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Download } from 'lucide-react';
import { ContentType, detectContentType, formatJson } from '../../utils/formatter';
import { downloadText } from '../../utils/fileExport';
import { useT } from '../../i18n/useT';
import { useThemeStore } from '../../store/themeStore';

interface ResponseBodyProps {
  body: string;
  headers: Record<string, string>;
}

const editorStyle: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, Fira Code, monospace',
};

const EXPORT_INFO: Record<ContentType, { extension: string; mimeType: string }> = {
  json: { extension: 'json', mimeType: 'application/json' },
  html: { extension: 'html', mimeType: 'text/html' },
  xml: { extension: 'xml', mimeType: 'application/xml' },
  text: { extension: 'txt', mimeType: 'text/plain' },
};

export function ResponseBody({ body, headers }: ResponseBodyProps) {
  const contentType = detectContentType(headers);
  const t = useT();
  const cmTheme = useThemeStore((state) => state.theme) === 'light' ? 'light' : 'dark';

  const displayBody = useMemo(() => {
    if (contentType === 'json') {
      return formatJson(body);
    }
    return body;
  }, [body, contentType]);

  if (!body) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
        {t('response.emptyBody')}
      </div>
    );
  }

  const handleExport = () => {
    const { extension, mimeType } = EXPORT_INFO[contentType];
    downloadText(`response.${extension}`, displayBody, mimeType);
  };

  const exportButton = (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-accent transition-colors"
      title={t('response.exportBody')}
    >
      <Download size={12} />
      <span>{t('response.exportBody')}</span>
    </button>
  );

  if (contentType === 'json') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-end px-2 py-1 bg-panel/50 border-b border-border/50 flex-shrink-0">
          {exportButton}
        </div>
        <div className="flex-1 overflow-auto">
          <CodeMirror
            value={displayBody}
            readOnly
            extensions={[json()]}
            theme={cmTheme}
            style={editorStyle}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: false,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-end px-2 py-1 bg-panel/50 border-b border-border/50 flex-shrink-0">
        {exportButton}
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-xs font-mono text-text-primary whitespace-pre-wrap break-all leading-relaxed">
          {displayBody}
        </pre>
      </div>
    </div>
  );
}

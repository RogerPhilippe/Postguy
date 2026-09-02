import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { detectContentType, formatJson } from '../../utils/formatter';
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

  if (contentType === 'json') {
    return (
      <div className="h-full overflow-auto">
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
    );
  }

  return (
    <div className="h-full overflow-auto">
      <pre className="p-4 text-xs font-mono text-text-primary whitespace-pre-wrap break-all leading-relaxed">
        {displayBody}
      </pre>
    </div>
  );
}

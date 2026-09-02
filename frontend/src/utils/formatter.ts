export function formatJson(str: string): string {
  if (!str || str.trim() === '') return str;
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return str;
  }
}

export function isValidJson(str: string): boolean {
  if (!str || str.trim() === '') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export type ContentType = 'json' | 'html' | 'xml' | 'text';

export function detectContentType(headers: Record<string, string>): ContentType {
  const contentType =
    headers['content-type'] ||
    headers['Content-Type'] ||
    '';

  const ct = contentType.toLowerCase();

  if (
    ct.includes('application/json') ||
    ct.includes('text/json') ||
    ct.includes('+json')
  ) {
    return 'json';
  }

  if (ct.includes('text/html') || ct.includes('application/xhtml')) {
    return 'html';
  }

  if (
    ct.includes('text/xml') ||
    ct.includes('application/xml') ||
    ct.includes('+xml')
  ) {
    return 'xml';
  }

  return 'text';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatDate(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

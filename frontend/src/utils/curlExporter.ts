import { RequestConfig, KeyValuePair } from '../types/request';

function escapeShell(str: string): string {
  return str.replace(/'/g, "'\\''");
}

export function toCurl(request: RequestConfig): string {
  const parts: string[] = ['curl'];

  // Method
  if (request.method !== 'GET') {
    parts.push(`-X ${request.method}`);
  }

  // Build URL with params
  let url = request.url;
  const enabledParams = request.params.filter((p: KeyValuePair) => p.enabled && p.key.trim());
  if (enabledParams.length > 0) {
    try {
      const parsedUrl = new URL(url);
      for (const param of enabledParams) {
        parsedUrl.searchParams.set(param.key, param.value);
      }
      url = parsedUrl.toString();
    } catch {
      // If URL parsing fails, append params manually
      const paramStr = enabledParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      url = url.includes('?') ? `${url}&${paramStr}` : `${url}?${paramStr}`;
    }
  }

  parts.push(`'${escapeShell(url)}'`);

  // Headers
  const enabledHeaders = request.headers.filter((h: KeyValuePair) => h.enabled && h.key.trim());
  for (const header of enabledHeaders) {
    parts.push(`-H '${escapeShell(header.key)}: ${escapeShell(header.value)}'`);
  }

  // Body
  if (request.bodyType === 'json' && request.body) {
    parts.push(`-H 'Content-Type: application/json'`);
    parts.push(`-d '${escapeShell(request.body)}'`);
  } else if (request.bodyType === 'x-www-form-urlencoded') {
    try {
      const pairs: KeyValuePair[] = JSON.parse(request.body || '[]');
      const enabledPairs = pairs.filter((p) => p.enabled && p.key);
      if (enabledPairs.length > 0) {
        const formData = enabledPairs
          .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&');
        parts.push(`--data-urlencode '${escapeShell(formData)}'`);
      }
    } catch {
      if (request.body) {
        parts.push(`--data-urlencode '${escapeShell(request.body)}'`);
      }
    }
  } else if (request.bodyType === 'form-data') {
    try {
      const pairs: KeyValuePair[] = JSON.parse(request.body || '[]');
      const enabledPairs = pairs.filter((p) => p.enabled && p.key);
      for (const pair of enabledPairs) {
        parts.push(`-F '${escapeShell(pair.key)}=${escapeShell(pair.value)}'`);
      }
    } catch {
      // skip
    }
  } else if (request.bodyType === 'raw' && request.body) {
    parts.push(`-d '${escapeShell(request.body)}'`);
  }

  return parts.join(' \\\n  ');
}

import { v4 as uuidv4 } from 'uuid';
import { BodyType, HttpMethod, KeyValuePair, RequestConfig } from '../types/request';
import { parseUrlParams } from './url';

interface ConvertedItem {
  name: string;
  request: RequestConfig;
}

interface ConvertedCollection {
  name: string;
  items: ConvertedItem[];
}

/** A common nested collection format used by several API client tools:
 *  `{ info: { name }, item: [...] }`, with folders as nested `item` arrays. */
export function isExternalCollectionFormat(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const raw = data as Record<string, unknown>;
  const info = raw.info as Record<string, unknown> | undefined;
  return Boolean(info && typeof info.name === 'string' && Array.isArray(raw.item));
}

function toKeyValuePairs(entries: unknown, keyField = 'key', valueField = 'value'): KeyValuePair[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => {
    const e = (entry ?? {}) as Record<string, unknown>;
    return {
      id: uuidv4(),
      key: typeof e[keyField] === 'string' ? (e[keyField] as string) : '',
      value: typeof e[valueField] === 'string' ? (e[valueField] as string) : '',
      enabled: !e.disabled,
    };
  });
}

function extractAuthHeader(auth: unknown): KeyValuePair | null {
  if (!auth || typeof auth !== 'object') return null;
  const a = auth as Record<string, unknown>;
  const type = a.type;

  const paramValue = (list: unknown, key: string): string | undefined => {
    if (!Array.isArray(list)) return undefined;
    const found = list.find((p) => (p as Record<string, unknown>)?.key === key);
    return found ? String((found as Record<string, unknown>).value ?? '') : undefined;
  };

  if (type === 'bearer') {
    const token = paramValue(a.bearer, 'token') ?? '';
    return { id: uuidv4(), key: 'Authorization', value: `Bearer ${token}`, enabled: true };
  }
  if (type === 'basic') {
    const username = paramValue(a.basic, 'username') ?? '';
    const password = paramValue(a.basic, 'password') ?? '';
    return { id: uuidv4(), key: 'Authorization', value: `Basic ${btoa(`${username}:${password}`)}`, enabled: true };
  }
  if (type === 'apikey') {
    const inHeader = (paramValue(a.apikey, 'in') ?? 'header') === 'header';
    if (!inHeader) return null;
    const headerName = paramValue(a.apikey, 'key') ?? 'X-API-Key';
    const headerValue = paramValue(a.apikey, 'value') ?? '';
    return { id: uuidv4(), key: headerName, value: headerValue, enabled: true };
  }
  // Other auth types (oauth2, digest, awsv4, ...) aren't supported — skip.
  return null;
}

function convertBody(body: unknown): { bodyType: BodyType; body: string } {
  if (!body || typeof body !== 'object') return { bodyType: 'none', body: '' };
  const b = body as Record<string, unknown>;

  switch (b.mode) {
    case 'raw': {
      const options = b.options as Record<string, unknown> | undefined;
      const raw = options?.raw as Record<string, unknown> | undefined;
      const language = raw?.language;
      return { bodyType: language === 'json' ? 'json' : 'raw', body: typeof b.raw === 'string' ? b.raw : '' };
    }
    case 'urlencoded': {
      const pairs = toKeyValuePairs(b.urlencoded);
      return { bodyType: 'x-www-form-urlencoded', body: JSON.stringify(pairs) };
    }
    case 'formdata': {
      const entries = Array.isArray(b.formdata) ? b.formdata : [];
      const textEntries = entries.filter((e) => (e as Record<string, unknown>)?.type !== 'file');
      const skipped = entries.length - textEntries.length;
      if (skipped > 0) {
        console.warn(`Collection import: skipped ${skipped} file field(s) in form-data (not supported).`);
      }
      return { bodyType: 'form-data', body: JSON.stringify(toKeyValuePairs(textEntries)) };
    }
    default:
      return { bodyType: 'none', body: '' };
  }
}

function convertRequest(name: string, request: unknown): ConvertedItem {
  const r = (request ?? {}) as Record<string, unknown>;
  const method = (typeof r.method === 'string' ? r.method.toUpperCase() : 'GET') as HttpMethod;

  let url = '';
  let params: KeyValuePair[] = [];
  if (typeof r.url === 'string') {
    url = r.url;
    params = parseUrlParams(url);
  } else if (r.url && typeof r.url === 'object') {
    const u = r.url as Record<string, unknown>;
    url = typeof u.raw === 'string' ? u.raw : '';
    params = Array.isArray(u.query) ? toKeyValuePairs(u.query) : parseUrlParams(url);
  }

  const headers = toKeyValuePairs(r.header);
  const authHeader = extractAuthHeader(r.auth);
  if (authHeader) headers.push(authHeader);

  const { bodyType, body } = convertBody(r.body);

  return {
    name,
    request: { method, url, params, headers, bodyType, body },
  };
}

/** Flattens the nested folder tree into a single list, prefixing each
 *  request's name with its parent folder path (e.g. "Users / Admin / Delete"). */
function flattenItems(items: unknown, folderPath: string[]): ConvertedItem[] {
  if (!Array.isArray(items)) return [];
  const result: ConvertedItem[] = [];

  for (const raw of items) {
    const item = (raw ?? {}) as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name : 'Untitled';

    if (item.request) {
      const fullName = folderPath.length > 0 ? `${folderPath.join(' / ')} / ${name}` : name;
      result.push(convertRequest(fullName, item.request));
    } else if (Array.isArray(item.item)) {
      result.push(...flattenItems(item.item, [...folderPath, name]));
    }
  }

  return result;
}

export function convertExternalCollection(data: unknown): ConvertedCollection {
  const raw = data as Record<string, unknown>;
  const info = raw.info as Record<string, unknown>;
  return {
    name: typeof info.name === 'string' ? info.name : 'Imported collection',
    items: flattenItems(raw.item, []),
  };
}
import { v4 as uuidv4 } from 'uuid';
import { KeyValuePair } from '../types/request';

export function parseUrlParams(url: string): KeyValuePair[] {
  try {
    const parsed = new URL(url);
    const pairs: KeyValuePair[] = [];
    parsed.searchParams.forEach((value, key) => {
      pairs.push({ id: uuidv4(), key, value, enabled: true });
    });
    return pairs;
  } catch {
    // Try parsing just the query string portion
    const questionIdx = url.indexOf('?');
    if (questionIdx === -1) return [];
    try {
      const search = url.slice(questionIdx + 1);
      const params = new URLSearchParams(search);
      const pairs: KeyValuePair[] = [];
      params.forEach((value, key) => {
        pairs.push({ id: uuidv4(), key, value, enabled: true });
      });
      return pairs;
    } catch {
      return [];
    }
  }
}
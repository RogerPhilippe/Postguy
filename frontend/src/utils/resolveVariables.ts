import { KeyValuePair } from '../types/request';

/** Replaces {{key}} occurrences with the matching enabled variable's value.
 *  Unmatched or disabled variables are left literal. */
export function resolveVariables(text: string, variables: KeyValuePair[]): string {
  if (!text) return text;
  const enabled = variables.filter((v) => v.enabled && v.key);
  if (enabled.length === 0) return text;

  return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, key: string) => {
    const found = enabled.find((v) => v.key === key);
    return found ? found.value : match;
  });
}

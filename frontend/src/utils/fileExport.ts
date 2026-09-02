export function downloadText(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  downloadText(filename, JSON.stringify(data, null, 2), 'application/json');
}

export function sanitizeFilename(name: string): string {
  const cleaned = name.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'collection';
}

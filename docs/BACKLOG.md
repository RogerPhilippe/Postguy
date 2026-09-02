# Backlog

## Collections storage limits

Collections have no size cap today, unlike History (`MAX_HISTORY = 100` in
`historyStore.ts`). Both persist to the browser's `localStorage`, which most
browsers cap around 5-10MB per origin — shared between Collections and
History. Large saved request bodies (big JSON payloads, uploads, etc.) count
against that quota, and `localStorage.setItem` throws when it's exceeded, a
failure we don't currently catch or surface to the user.

Ideas:

- Add an item-count and/or approximate byte-size cap on Collections, similar
  to History's `MAX_HISTORY`, with a warning before hitting the limit.
- Catch `localStorage` quota errors and show a clear message instead of
  failing silently.
- Consider migrating persistence from `localStorage` to IndexedDB for a much
  larger quota and non-blocking writes.
- Virtualize the Collections/History list in the Sidebar if item counts get
  large enough to affect render performance.
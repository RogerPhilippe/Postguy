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

## Move Collections to a server-side SQLite database (open for study)

Idea: instead of persisting Collections in the browser's `localStorage`,
store them in an embedded SQLite database on the Ktor backend, with REST
endpoints (`GET/POST/DELETE /collections`, etc.) replacing the client-only
`collectionsStore.ts`. SQLite is just a file, so this wouldn't break the
"single JAR, nothing else to run" distribution story, and it fully sidesteps
the `localStorage` quota problem noted above. Server-side export/import
would also be more robust than the current Blob + `<a download>` trick in
the browser — a plain file response/upload.

**Not decided yet — open questions to resolve before designing this:**

- **Single-user vs. shared instance.** Today every browser/person has their
  own isolated Collections, the same way `localStorage` naturally isolates
  per browser. If Collections move to the backend, everyone hitting that
  running instance would see the *same* Collections, unless rows are
  partitioned somehow.

  Leaning towards: an anonymous client ID, not real authentication. On
  first load, the frontend generates a UUID (`crypto.randomUUID()` or the
  `uuid` package already used) and stores it in `localStorage`; every
  Collections request sends it (e.g. an `X-Client-Id` header), and SQLite
  rows are scoped by that ID. No login, no password, no session — mirrors
  how `localStorage` already isolates data per browser today.

  This is *identification, not authentication* — anyone who obtains the
  UUID (e.g. via devtools) can access that client's Collections with no
  further proof of identity. Reasonable for the common case (personal use
  on `localhost`), weak isolation if an instance is ever exposed to
  multiple people over the network. Worth surfacing the UUID somewhere in
  the UI so a user can copy it to another browser/machine to "recover"
  their Collections there.
- **Does History move too, or only Collections?** History is more
  ephemeral (capped, replaceable) than Collections (curated, meant to
  last), so it might be fine to leave History client-side even if
  Collections move server-side — needs a decision either way.
- Where the `.db` file lives on disk (next to the jar? configurable path
  in `application.yaml`?), and what a minimal migration/schema story looks
  like given there's no such tooling in the project today.
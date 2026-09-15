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

## P2P collection sharing via invite (open for study, not started)

Idea: let two users share Collections directly with each other via an
invite code, without either side opening/forwarding a port. Uses WebRTC
DataChannels (peer-to-peer, DTLS-encrypted) between the two frontends,
with a minimal signaling server only for the handshake — no central
storage of shared data, no open ports on the user's machine.

Depends on the [server-side SQLite storage](#move-collections-to-a-server-side-sqlite-database-open-for-study)
item above being resolved first — sharing needs a persistent, addressable
Collection to share, and a notion of ownership per Collection.

Rough shape:

- **Signaling server** — small WebSocket service (ours to host) that only
  relays SDP offer/answer and ICE candidates between the two peers while
  they connect. Sees no Collection data, stores nothing persistent.
- **STUN** — public/free (e.g. `stun.l.google.com`) for NAT hole-punching,
  so most direct connections need no relay at all.
- **TURN fallback** — needed for robustness; hole-punching fails for a
  meaningful share of real users (symmetric NAT/CGNAT). Self-hosted
  `coturn` or a paid TURN provider. Without it, some invites simply won't
  connect.
- **Device identity** — each install generates a keypair (WebCrypto) on
  first run; no account/password. An invite code encodes the inviter's
  signaling ID + public key, with an expiry.
- **Sharing model** — a Collection gains an `owner` + list of peers with
  read/write access, stored alongside it in SQLite.
- **Sync** — on connect, the DataChannel pushes the collections the owner
  marked as shared; both sides need to be online simultaneously (this is
  P2P, not an always-on server), so no offline/async sharing without
  reintroducing some central storage — a tradeoff to accept explicitly.

**Open questions to resolve before designing this:**

- Who hosts the signaling/TURN infra long-term, and what's the cost/who
  pays for TURN relay bandwidth if hole-punching fails often.
- Revoking a shared collection / removing a peer's access after the fact.
- Conflict resolution if both sides edit a shared Collection while
  connected (last-write-wins? owner-authoritative?).
- How invite codes are exchanged out-of-band (copy/paste text, QR code,
  link?) and how long they stay valid.
- Whether History or only Collections are shareable, mirroring the open
  question in the SQLite item above.

## Technical debt: variables aren't picked up from external collection imports

Postguy now supports Environments (named sets of `{{key}}` variables,
resolved at send time from whichever environment is active — see
`environmentsStore.ts` and `utils/resolveVariables.ts`). The external
collection importer (`utils/externalCollectionImport.ts`) does not extract
any variable definitions from an imported file, even though the common
nested collection format it supports can carry them in two different
places:

- A `variable` array embedded directly in the collection JSON itself
  (travels with the file the importer already reads) — not extracted.
- A separate "environment" export file (a different top-level shape
  entirely, not the `info`/`item` collection shape) — not detected or
  imported at all.

Deferred deliberately to keep the Environments feature scoped. A request
imported from such a file will carry its `{{...}}` placeholders literal
and unresolved until the user manually recreates the matching variables in
an Environment.
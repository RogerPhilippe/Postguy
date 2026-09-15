# Security Backlog

This backlog tracks security and reliability work identified during the
project review. Priorities assume Postguy may be reachable by hosts other
than the machine running it. For a localhost-only installation, the proxy
items remain important guardrails before any broader deployment.

## P0 - Restrict the proxy endpoint

`POST /proxy` accepts an arbitrary URL and performs the request from the Ktor
server. If the server is reachable by an untrusted client, it can be used to
access internal network services or cloud metadata endpoints (SSRF).

### Work

- Define the supported deployment model: localhost-only by default, or
  authenticated multi-user service.
- Bind to loopback by default when running as a local tool.
- When non-local access is enabled, require authentication and explicitly
  authorize callers.
- Reject private, loopback, link-local, multicast, and unspecified IP
  destinations, including addresses reached after DNS resolution or a
  redirect.
- Apply an explicit destination allowlist when the deployment requires it.
- Test rejected IPv4, IPv6, hostname, DNS-resolution, and redirect cases.

### Done when

Untrusted callers cannot use the proxy to reach services that are not an
approved public destination.

## P0 - Constrain cross-origin access

The Ktor CORS configuration uses `anyHost()`. Combined with the unrestricted
proxy endpoint, a website visited by a user can issue requests through a
network-accessible Postguy instance.

### Work

- Remove `anyHost()` from production configuration.
- Configure approved origins by environment.
- Disable CORS unless a separate frontend origin is required.
- Add integration tests that reject unknown origins.

### Done when

Only configured frontend origins can invoke the API from a browser.

## P1 - Limit request and response resources

The proxy reads an entire upstream response into memory and accepts client
provided bodies without an application-level size limit. A large upload or
response can exhaust memory or tie up the service.

### Work

- Set maximum inbound request-body and outbound response-body sizes.
- Stream or stop reading responses once the configured response limit is
  exceeded.
- Set connection, socket, and total-request timeouts explicitly.
- Bound redirects and reapply destination validation after every redirect.
- Return a clear client-facing error for each enforced limit.
- Add tests for oversized bodies, slow responses, and redirect chains.

### Done when

One request cannot consume unbounded memory, connections, or processing time.

## P1 - Prevent internal error disclosure

Unhandled exceptions are serialized with their messages in `StatusPages`.
Messages can reveal implementation, dependency, filesystem, or upstream
service details.

### Work

- Return a stable public error code and generic message for unexpected
  failures.
- Log the full exception server-side with a request correlation ID.
- Preserve safe, actionable errors only for expected validation and upstream
  failure conditions.
- Test that unexpected exception messages are not returned to clients.

### Done when

Clients receive useful error identifiers without implementation details.

## P1 - Establish HTTP security defaults

`configureSecurity()` currently has no active configuration.

### Work

- Add appropriate response headers for the UI, including a restrictive
  Content Security Policy, `X-Content-Type-Options`, and a clickjacking
  protection policy.
- Configure transport security only when HTTPS termination is enabled and
  documented.
- Disable server technology disclosure where it is not useful; `X-Engine:
  Ktor` currently exposes the framework.
- Add header-focused integration tests.

### Done when

The web UI serves documented, tested browser security headers appropriate to
its deployment mode.

## P2 - Protect locally persisted sensitive data

Collections, history, and environments persist to browser `localStorage`.
They may include authorization headers, environment secrets, request bodies,
and response bodies. Browser storage is not encrypted and has a limited
quota.

### Work

- Warn users before saving credentials, tokens, or sensitive response data.
- Offer a way to exclude sensitive headers, variables, and bodies from
  history and collections.
- Define per-item and total byte limits, then surface storage quota failures
  to the user.
- Evaluate IndexedDB or an opt-in server-side store for larger, non-blocking
  persistence.
- Document that browser storage is local to the browser profile and should
  not be treated as a secret vault.

### Done when

Users can control persistent sensitive data and receive actionable feedback
before data loss or quota failures.

## P2 - Restore frontend linting and dependency hygiene

The frontend defines an ESLint command, but `eslint` is not declared in
`frontend/package.json`; consequently `npm run lint` fails after a clean
install. The dependency installation also reports 12 known vulnerabilities:
6 high, 4 moderate, and 2 low.

### Work

- Add and configure ESLint as a development dependency, following the
  project's TypeScript and React conventions.
- Run lint in local validation and CI.
- Review `npm audit` output, upgrade affected direct dependencies where
  compatible, and track unavoidable transitive findings with owners and
  review dates.
- Keep the lockfile synchronized with dependency changes.

### Done when

A clean install can run lint successfully and dependency findings are either
remediated or explicitly tracked.

## P2 - Add security-focused automated tests

The current backend test coverage verifies only that the root route returns
success. Security behavior is not protected against regressions.

### Work

- Add Ktor integration tests for proxy destination validation, CORS, error
  responses, request limits, response limits, redirects, and timeouts.
- Add frontend tests for excluding sensitive data from persistence once that
  behavior exists.
- Run the relevant suites in CI.

### Done when

The security controls in this backlog have automated regression coverage.

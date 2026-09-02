[English](README.md) · [Português (BR)](README.pt-BR.md) · [Español](README.es.md)

# Postguy

An HTTP client for the browser — send requests, inspect responses, nothing to install.

A Kotlin/Ktor backend makes the HTTP calls (avoiding CORS restrictions) and serves the React interface on the same port.

## Running locally

Requirements: JDK 21+, Node.js 18+

```bash
./gradlew run
```

Open **http://localhost:8080**

## Stack

Kotlin · Ktor · React · TypeScript · Vite · Tailwind · Zustand

## License

Postguy is distributed under a **dual license**:

- [AGPLv3](LICENSE) — free, as long as any modified version (including use
  as a network service) is also made available under the same license.
- [Commercial license](COMMERCIAL-LICENSE.md) — for companies that want to
  use, embed, or offer Postguy as a service without the AGPLv3's
  open-source obligations.

Contributions are subject to the terms in [CONTRIBUTING.md](CONTRIBUTING.md).
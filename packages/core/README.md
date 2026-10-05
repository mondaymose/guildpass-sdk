# @lumenpass/core

Foundational runtime, transport layer, middleware pipeline, cryptographic fingerprinting, and Stellar validation primitives for the **LumenPass SDK**.

## Features

- **HTTP Transport**: Robust `HttpTransport` with configurable request timeouts, abort signal handling, and status mappings.
- **Middleware Pipeline**: Extensible onion-style middleware engine for logging, header injection, diagnostics, and auth.
- **Stellar Account Validation**: StrKey checksum verification, account parsing (`isStellarAccountId`, `parseStellarAccountId`), and display truncation.
- **Resilience**: Configurable exponential backoff retries, cache policy evaluation, and in-flight request deduplication.
- **Security & Redaction**: Automated secret masking, header sanitization, and 16-character deterministic fingerprinting.
- **Runtime Schemas**: High-performance, depth-bounded validation schemas with detailed path reporting.

## Installation

```bash
pnpm add @lumenpass/core
# or
npm install @lumenpass/core
```

## License

[MIT](./LICENSE)

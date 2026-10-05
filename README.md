<p align="center">
  <img src="./logo/Guidlpass%20SDK%20Logo.png" alt="LumenPass SDK Logo" width="220" />
</p>

<h1 align="center">LumenPass SDK</h1>

<p align="center">
  <strong>The official TypeScript SDK for building applications on top of LumenPass.</strong>
</p>

<p align="center">
  A modern, Stellar-first developer interface for programmable community membership, access control, and guild management.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Stellar-Ready-7C3AED" alt="Stellar" />
  <img src="https://img.shields.io/badge/Package-@lumenpass%2Fsdk-6F42C1" alt="@lumenpass/sdk" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License" />
</p>

---

## Overview

**LumenPass SDK** provides strongly typed, high-level client libraries and core infrastructure for integrating web applications, community tooling, and services with the LumenPass ecosystem on Stellar and Soroban.

Key capabilities include:

- **Access Evaluation**: Dynamic rule-based permission and access checks for community features.
- **Guild & Community Management**: Create, retrieve, update, delete, and paginate programmable guilds.
- **Stellar Native**: Built-in StrKey account validation, network helpers, and Soroban integration.
- **Resilient Transport**: Configurable retries, request deduplication, timeout handling, and secret redaction.
- **Modular Monorepo**: Decoupled `@lumenpass/core` primitives with high-level `@lumenpass/sdk` bindings.

---

## Installation

Install the SDK in your project:

```bash
# Using pnpm (recommended)
pnpm add @lumenpass/sdk

# Using npm
npm install @lumenpass/sdk

# Using yarn
yarn add @lumenpass/sdk
```

---

## Quickstart Guide

### 1. Initialize the Client

```typescript
import { LumenPassClient } from "@lumenpass/sdk";

const client = new LumenPassClient({
  baseUrl: "https://api.testnet.guildpass.io",
  timeoutMs: 15000,
  headers: {
    "x-api-key": process.env.LUMENPASS_API_KEY ?? "demo-key",
  },
});
```

> **Note**: `GuildPassClient` is preserved as an alias for backwards compatibility.

### 2. Validate Stellar Accounts

Validate and parse Stellar StrKey public keys before making requests:

```typescript
import {
  isStellarAccountId,
  parseStellarAccountId,
  truncateStellarAccountId,
} from "@lumenpass/sdk";

const account = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";

if (isStellarAccountId(account)) {
  const validAccount = parseStellarAccountId(account);
  console.log("Display account:", truncateStellarAccountId(validAccount)); // GAAZI4...CCWN7
}
```

### 3. Check Access Permissions

Verify whether a Stellar account satisfies access policy rules for a specific resource:

```typescript
import { AccessDecision } from "@lumenpass/sdk";

const decision: AccessDecision = await client.access.check({
  guildId: "guild-stellar-builders",
  account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  resource: "developer-forum",
  action: "post",
});

if (decision.allowed) {
  console.log("Access granted!");
} else {
  console.log(`Access denied: ${decision.reason}`);
}
```

### 4. Manage Communities & Guilds

Use `client.guilds` to create, retrieve, update, and paginate guilds:

```typescript
// Create a new guild
const guild = await client.guilds.create({
  name: "Soroban Builders",
  ownerAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  network: "testnet",
  description: "Community of Soroban smart contract developers",
});

// Retrieve a guild by ID
const fetched = await client.guilds.get(guild.id);
console.log("Guild:", fetched.name);

// Paginate through guilds
for await (const g of client.guilds.paginate({ limit: 25 }, { maxPages: 5 })) {
  console.log(`- ${g.name} (${g.id})`);
}
```

### 5. Typed Error Handling

Handle API, network, and validation errors using the unified error hierarchy:

```typescript
import { isLumenPassError, HttpError, TimeoutError, NetworkError } from "@lumenpass/sdk";

try {
  await client.guilds.get("non-existent-guild");
} catch (error: unknown) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  } else if (error instanceof TimeoutError) {
    console.error("Request timed out");
  } else if (error instanceof NetworkError) {
    console.error("Network connection failure");
  } else if (isLumenPassError(error)) {
    console.error(`LumenPass Error [${error.code}]: ${error.message}`);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Workspace Packages

This monorepo is structured into decoupled packages:

| Package               | Directory                          | Description                                                                                                          |
| :-------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **`@lumenpass/sdk`**  | [`packages/sdk`](./packages/sdk)   | Primary high-level SDK client, resources (`access`, `guilds`), and public domain types.                              |
| **`@lumenpass/core`** | [`packages/core`](./packages/core) | Foundational runtime: HTTP transport, middleware pipeline, caching, retry policies, Stellar helpers, and validation. |

---

## Development

Prerequisites: [Node.js 24+](https://nodejs.org/) and [pnpm 10+](https://pnpm.io/).

```bash
# Install all dependencies across workspace packages
pnpm install

# Build core and sdk packages
pnpm build

# Run unit and integration tests across the monorepo
pnpm test

# Run TypeScript typechecks
pnpm typecheck

# Format code
pnpm format
```

---

## Documentation & Guides

- [API Reference](docs/api-reference.md) — Comprehensive technical reference for classes, resources, and helpers.
- [Guild APIs Specification](docs/implement_guild_apis_in_guildp.md) — Technical spec for the Guilds API resource.
- [Runtime Validation System](VALIDATION.md) — Lightweight, schema-driven validation architecture.
- [Runnable Quickstart](examples/quickstart.ts) — Executable end-to-end TypeScript example.

---

## License

This project is licensed under the [MIT License](LICENSE).

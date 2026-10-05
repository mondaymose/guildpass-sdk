# @lumenpass/sdk

Official high-level TypeScript SDK for interacting with **LumenPass** — the Stellar-first programmable community membership and access control platform.

## Features

- **LumenPassClient**: Ergonomic, strongly typed client with built-in configuration validation, header composition, and error normalization.
- **Access Evaluation (`client.access.check`)**: Dynamic rule-based permission and access checks evaluated against LumenPass Core.
- **Guild Management (`client.guilds`)**: Endpoints to create, retrieve, update, delete, and paginate communities and guilds.
- **Automatic Pagination**: Cursor-based async iterator helpers (`client.guilds.paginate()`, `paginate()`, `collectAll()`).
- **Backward Compatibility**: Fully exports `GuildPassClient`, `GuildPassError`, `GuildPassErrorCode`, and related symbols.

## Installation

```bash
pnpm add @lumenpass/sdk
# or
npm install @lumenpass/sdk
```

## Quick Example

```typescript
import { LumenPassClient } from "@lumenpass/sdk";

const client = new LumenPassClient({
  baseUrl: "https://api.testnet.guildpass.io",
  headers: {
    "x-api-key": process.env.LUMENPASS_API_KEY ?? "demo-key",
  },
});

// Check community access
const decision = await client.access.check({
  guildId: "guild-stellar-builders",
  account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
});

if (decision.allowed) {
  console.log("Access granted!");
}
```

## License

[MIT](./LICENSE)

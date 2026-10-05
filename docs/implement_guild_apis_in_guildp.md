# Technical Specification: Implement Guild APIs in GuildPass SDK V2

## Overview

The Guilds API provides developers with first-class primitives to manage programmable communities and guilds within GuildPass. This component is exposed on `GuildPassClient` via `client.guilds` (implemented in `GuildsResource`).

---

## 1. Implementation Context

### Architecture & Placement

- **Package**: `@lumenpass/sdk`
- **Resource Class**: `GuildsResource` (`packages/sdk/src/resources/guilds.ts`)
- **Types**: `CreateGuildParams`, `UpdateGuildParams`, `ListGuildsParams`, `DeleteGuildResult` (`packages/sdk/src/types/guilds.ts`)
- **Client Property**: `client.guilds` on `LumenPassClient` (`packages/sdk/src/client/index.ts`)
- **Transport**: Utilizes `HttpTransport` from `@lumenpass/core` for all network communications.

### Endpoints Implemented

| Method                                      | Endpoint                  | Description                                                 |
| ------------------------------------------- | ------------------------- | ----------------------------------------------------------- |
| `client.guilds.get(guildId)`                | `GET /guilds/:guildId`    | Retrieves a single guild by its identifier.                 |
| `client.guilds.list(params?)`               | `GET /guilds`             | Queries guilds with optional filters and cursor pagination. |
| `client.guilds.create(params)`              | `POST /guilds`            | Creates a new guild with validated owner Stellar account.   |
| `client.guilds.update(guildId, params)`     | `PATCH /guilds/:guildId`  | Updates attributes or metadata of an existing guild.        |
| `client.guilds.delete(guildId)`             | `DELETE /guilds/:guildId` | Deletes or archives a guild.                                |
| `client.guilds.paginate(params?, options?)` | `GET /guilds`             | Asynchronous generator iterating over guilds across pages.  |

---

## 2. Usage Guidelines

### Initializing the Client

```typescript
import { LumenPassClient } from "@lumenpass/sdk";

const client = new LumenPassClient({
  baseUrl: "https://api.testnet.guildpass.io",
  headers: {
    "x-api-key": "gp_live_...",
  },
});
```

### Creating a Guild

```typescript
import { Guild, CreateGuildParams } from "@lumenpass/sdk";

const newGuild: Guild = await client.guilds.create({
  name: "Soroban Developers Guild",
  description: "Ecosystem guild for Stellar Soroban contract developers",
  ownerAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  network: "testnet",
  contractId: "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  metadata: {
    discord: "https://discord.gg/soroban",
    tags: ["smart-contracts", "rust", "soroban"],
  },
});

console.log("Created guild ID:", newGuild.id);
```

### Retrieving a Guild

```typescript
const guild = await client.guilds.get("guild_soroban_devs");
console.log("Guild name:", guild.name);
console.log("Owner Stellar account:", guild.ownerAccount);
```

### Updating a Guild

```typescript
const updated = await client.guilds.update("guild_soroban_devs", {
  description: "Updated description for the Soroban Developers Guild",
  metadata: {
    active: true,
  },
});
```

### Listing Guilds with Filtering

```typescript
const page = await client.guilds.list({
  limit: 20,
  network: "testnet",
  ownerAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
});

for (const guild of page.items) {
  console.log(`- ${guild.name} (${guild.id})`);
}

if (page.nextCursor) {
  console.log("Next cursor available:", page.nextCursor);
}
```

### Paginating Automatically Across All Pages

```typescript
for await (const guild of client.guilds.paginate({ limit: 50 }, { maxPages: 10 })) {
  console.log(`Processing guild: ${guild.id}`);
}
```

### Deleting a Guild

```typescript
const result = await client.guilds.delete("guild_soroban_devs");
console.log("Deleted:", result.deleted); // true
```

---

## 3. Edge-Case Handling & Validation

### Input Validation

1. **Stellar Account Format**:
   - `ownerAccount` is strictly validated using `isStellarAccountId` (StrKey checksum and format validation).
   - Passing an invalid address throws a synchronous `Error` prior to transmitting any network request.
2. **Identifier Validation**:
   - `guildId` parameters are verified to be non-empty, trimmed strings.
   - Values are properly URL-encoded (`encodeURIComponent`) when constructing endpoint paths to guard against path traversal or special characters.
3. **Required Fields**:
   - `name` is required for guild creation and must be a non-empty string.
   - Paging limit must be a positive integer if provided.

### Response Normalization

- Supports both direct response objects (`Guild`, `Guild[]`) and wrapped Core payload shapes (`{ guild: Guild }`, `{ items: Guild[], nextCursor }`, `{ guilds: Guild[], nextCursor }`).

### Error Mapping

- Standard HTTP status errors returned by GuildPass Core (e.g. `404 Not Found`, `401 Unauthorized`, `500 Internal Server Error`) are wrapped in strongly typed `HttpError` instances containing machine-readable status codes and error payloads.
- Network and timeout disruptions produce `NetworkError` and `TimeoutError` respectively, maintaining consistency with the `GuildPassError` hierarchy.

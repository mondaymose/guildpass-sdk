import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GuildPassClient } from "../../src/client/index.js";
import { GuildsResource } from "../../src/resources/guilds.js";
import { HttpError, NetworkError, TimeoutError } from "@lumenpass/core";
import type { Guild } from "../../src/types/domain.js";

const originalFetch = global.fetch;

describe("GuildsResource & client.guilds", () => {
  const mockBaseUrl = "https://api.guildpass.example";
  const validStellarAccount = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  const validContractId = "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";

  let client: GuildPassClient;

  beforeEach(() => {
    client = new GuildPassClient({
      baseUrl: mockBaseUrl,
      headers: {
        "x-api-key": "gp_test_secret_key",
      },
    });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("API shape & initialization", () => {
    it("exposes client.guilds as an instance of GuildsResource", () => {
      expect(client.guilds).toBeDefined();
      expect(client.guilds).toBeInstanceOf(GuildsResource);
      expect(typeof client.guilds.get).toBe("function");
      expect(typeof client.guilds.list).toBe("function");
      expect(typeof client.guilds.create).toBe("function");
      expect(typeof client.guilds.update).toBe("function");
      expect(typeof client.guilds.delete).toBe("function");
      expect(typeof client.guilds.paginate).toBe("function");
    });
  });

  describe("get()", () => {
    it("retrieves a guild by ID (direct response format)", async () => {
      const mockGuild: Guild = {
        id: "guild_123",
        name: "Stellar Builders",
        ownerAccount: validStellarAccount,
        network: "testnet",
        createdAt: "2026-09-01T00:00:00.000Z",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockGuild), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await client.guilds.get("guild_123");

      expect(result).toEqual(mockGuild);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, init] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds/guild_123");
      expect(init?.method).toBe("GET");
      expect((init?.headers as Headers).get("x-api-key")).toBe("gp_test_secret_key");
    });

    it("retrieves a guild by ID (wrapped response format)", async () => {
      const mockGuild: Guild = {
        id: "guild_456",
        name: "Soroban Artisans",
        ownerAccount: validStellarAccount,
        network: "public",
        createdAt: "2026-09-01T00:00:00.000Z",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ guild: mockGuild }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await client.guilds.get("guild_456");
      expect(result).toEqual(mockGuild);
    });

    it("URL-encodes the guild ID parameter", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "g/special#1",
            name: "Special",
            ownerAccount: validStellarAccount,
            network: "testnet",
            createdAt: "2026-01-01T00:00:00.000Z",
          }),
          { status: 200 },
        ),
      );

      await client.guilds.get("g/special#1");
      const [url] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds/g%2Fspecial%231");
    });

    it("rejects missing or empty guildId", async () => {
      await expect(client.guilds.get("")).rejects.toThrow("guildId is required");
      await expect(client.guilds.get("   ")).rejects.toThrow("guildId is required");
      await expect((client.guilds as any).get(null)).rejects.toThrow("guildId is required");
    });

    it("propagates 404 HttpError when guild is not found", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Guild not found", code: "NOT_FOUND" }), {
          status: 404,
          statusText: "Not Found",
          headers: { "Content-Type": "application/json" },
        }),
      );

      await expect(client.guilds.get("nonexistent")).rejects.toThrow(HttpError);
    });
  });

  describe("list()", () => {
    it("lists guilds without query parameters", async () => {
      const mockList: Guild[] = [
        {
          id: "guild_1",
          name: "Guild 1",
          ownerAccount: validStellarAccount,
          network: "testnet",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ items: mockList, nextCursor: "cur_next" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const page = await client.guilds.list();
      expect(page.items).toEqual(mockList);
      expect(page.nextCursor).toBe("cur_next");

      const [url] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds");
    });

    it("applies query parameters and serializes deterministically", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], nextCursor: null }), {
          status: 200,
        }),
      );

      await client.guilds.list({
        limit: 25,
        cursor: "page_cursor_token",
        ownerAccount: validStellarAccount,
        network: "testnet",
      });

      const [url] = vi.mocked(global.fetch).mock.calls[0];
      const parsedUrl = new URL(url);
      expect(parsedUrl.pathname).toBe("/guilds");
      expect(parsedUrl.searchParams.get("limit")).toBe("25");
      expect(parsedUrl.searchParams.get("cursor")).toBe("page_cursor_token");
      expect(parsedUrl.searchParams.get("ownerAccount")).toBe(validStellarAccount);
      expect(parsedUrl.searchParams.get("network")).toBe("testnet");
    });

    it("handles { guilds: [...] } response shape from Core", async () => {
      const mockList: Guild[] = [
        {
          id: "guild_alt",
          name: "Alt Shape",
          ownerAccount: validStellarAccount,
          network: "testnet",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ guilds: mockList, nextCursor: null }), {
          status: 200,
        }),
      );

      const page = await client.guilds.list();
      expect(page.items).toEqual(mockList);
      expect(page.nextCursor).toBeNull();
    });

    it("validates positive numeric limit", async () => {
      await expect(client.guilds.list({ limit: 0 })).rejects.toThrow("positive integer");
      await expect(client.guilds.list({ limit: -5 })).rejects.toThrow("positive integer");
    });
  });

  describe("create()", () => {
    it("creates a new guild with validated parameters", async () => {
      const createdGuild: Guild = {
        id: "guild_new",
        name: "New Web3 Guild",
        description: "A passionate community",
        ownerAccount: validStellarAccount,
        contractId: validContractId,
        network: "testnet",
        metadata: { tags: ["soroban", "dao"] },
        createdAt: "2026-10-01T00:00:00.000Z",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(createdGuild), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await client.guilds.create({
        name: "New Web3 Guild",
        ownerAccount: validStellarAccount,
        description: "A passionate community",
        contractId: validContractId,
        network: "testnet",
        metadata: { tags: ["soroban", "dao"] },
      });

      expect(result).toEqual(createdGuild);

      const [url, init] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds");
      expect(init?.method).toBe("POST");

      const body = JSON.parse(init?.body as string);
      expect(body.name).toBe("New Web3 Guild");
      expect(body.ownerAccount).toBe(validStellarAccount);
      expect(body.description).toBe("A passionate community");
      expect(body.contractId).toBe(validContractId);
    });

    it("rejects missing or empty name", async () => {
      await expect(
        client.guilds.create({
          name: "",
          ownerAccount: validStellarAccount,
        }),
      ).rejects.toThrow("name is required");

      await expect(
        (client.guilds as any).create({
          name: 123,
          ownerAccount: validStellarAccount,
        }),
      ).rejects.toThrow("name is required");
    });

    it("rejects missing ownerAccount", async () => {
      await expect(
        (client.guilds as any).create({
          name: "Test Guild",
        }),
      ).rejects.toThrow("ownerAccount is required");
    });

    it("rejects invalid Stellar address for ownerAccount", async () => {
      await expect(
        client.guilds.create({
          name: "Test Guild",
          ownerAccount: "INVALID_STELLAR_ADDRESS",
        }),
      ).rejects.toThrow("Invalid Stellar account ID");
    });
  });

  describe("update()", () => {
    it("updates existing guild attributes", async () => {
      const updatedGuild: Guild = {
        id: "guild_edit",
        name: "Updated Name",
        description: "Updated Description",
        ownerAccount: validStellarAccount,
        network: "testnet",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-10-05T00:00:00.000Z",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(updatedGuild), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await client.guilds.update("guild_edit", {
        name: "Updated Name",
        description: "Updated Description",
      });

      expect(result).toEqual(updatedGuild);

      const [url, init] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds/guild_edit");
      expect(init?.method).toBe("PATCH");

      const body = JSON.parse(init?.body as string);
      expect(body.name).toBe("Updated Name");
      expect(body.description).toBe("Updated Description");
    });

    it("validates ownerAccount if provided in update payload", async () => {
      await expect(
        client.guilds.update("guild_edit", {
          ownerAccount: "MALFORMED_ACCOUNT",
        }),
      ).rejects.toThrow("Invalid Stellar account ID");
    });
  });

  describe("delete()", () => {
    it("deletes a guild by ID", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
        }),
      );

      const result = await client.guilds.delete("guild_to_remove");
      expect(result).toEqual({ id: "guild_to_remove", deleted: true });

      const [url, init] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe("https://api.guildpass.example/guilds/guild_to_remove");
      expect(init?.method).toBe("DELETE");
    });

    it("rejects empty guildId for delete", async () => {
      await expect(client.guilds.delete("")).rejects.toThrow("guildId is required");
    });
  });

  describe("paginate()", () => {
    it("iterates over multiple pages of guilds", async () => {
      const page1: Guild[] = [
        {
          id: "g_1",
          name: "Guild 1",
          ownerAccount: validStellarAccount,
          network: "testnet",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ];
      const page2: Guild[] = [
        {
          id: "g_2",
          name: "Guild 2",
          ownerAccount: validStellarAccount,
          network: "testnet",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ];

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ items: page1, nextCursor: "page_2_token" }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ items: page2, nextCursor: null }), {
            status: 200,
          }),
        );

      const collected: Guild[] = [];
      for await (const guild of client.guilds.paginate({ limit: 1 }, { maxPages: 5 })) {
        collected.push(guild);
      }

      expect(collected).toHaveLength(2);
      expect(collected[0].id).toBe("g_1");
      expect(collected[1].id).toBe("g_2");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

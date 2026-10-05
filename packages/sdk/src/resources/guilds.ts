import {
  HttpTransport,
  serializeQuery,
  isStellarAccountId,
  paginate,
  type Page,
} from "@lumenpass/core";
import type { Guild } from "../types/domain.js";
import type {
  CreateGuildParams,
  UpdateGuildParams,
  ListGuildsParams,
  DeleteGuildResult,
} from "../types/guilds.js";

/**
 * Resource client for managing communities and guilds in GuildPass.
 */
export class GuildsResource {
  constructor(
    private readonly transport: HttpTransport,
    private readonly defaultHeaders: Readonly<Record<string, string>> = {},
  ) {}

  /**
   * Retrieves a single guild by its unique identifier.
   *
   * @param guildId - The unique guild identifier.
   * @returns The resolved Guild record.
   * @throws {Error} If guildId is invalid.
   * @throws {HttpError} On API failure (e.g. 404 if not found).
   */
  public async get(guildId: string): Promise<Guild> {
    if (!guildId || typeof guildId !== "string" || !guildId.trim()) {
      throw new Error("guildId is required and must be a non-empty string");
    }

    const path = `/guilds/${encodeURIComponent(guildId.trim())}`;
    const response = await this.transport.request<Guild | { guild: Guild }>({
      method: "GET",
      path,
      headers: { ...this.defaultHeaders },
    });

    if (
      response &&
      typeof response === "object" &&
      "guild" in response &&
      (response as any).guild
    ) {
      return (response as any).guild as Guild;
    }
    return response as Guild;
  }

  /**
   * Queries and lists guilds with optional filters and cursor-based pagination.
   *
   * @param params - Query parameters (limit, cursor, ownerAccount, network).
   * @returns Paginated Page of Guild objects.
   */
  public async list(params?: ListGuildsParams): Promise<Page<Guild>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.limit !== undefined) {
        if (typeof params.limit !== "number" || params.limit <= 0) {
          throw new Error("limit must be a positive integer");
        }
        queryParams.limit = params.limit;
      }
      if (params.cursor !== undefined && params.cursor !== null) {
        queryParams.cursor = String(params.cursor);
      }
      if (params.ownerAccount !== undefined && params.ownerAccount !== null) {
        queryParams.ownerAccount = String(params.ownerAccount);
      }
      if (params.network !== undefined && params.network !== null) {
        queryParams.network = String(params.network);
      }
    }

    const queryString = serializeQuery(queryParams);
    const path = queryString ? `/guilds?${queryString}` : "/guilds";

    const response = await this.transport.request<
      { items?: Guild[]; guilds?: Guild[]; nextCursor?: string | null } | Guild[]
    >({
      method: "GET",
      path,
      headers: { ...this.defaultHeaders },
    });

    if (Array.isArray(response)) {
      return {
        items: response,
        nextCursor: null,
      };
    }

    const items = response?.items ?? response?.guilds ?? [];
    const nextCursor = response?.nextCursor ?? null;

    return {
      items,
      nextCursor,
    };
  }

  /**
   * Creates a new guild / community in GuildPass Core.
   *
   * @param params - Specification for the guild to create.
   * @returns The newly created Guild record.
   * @throws {Error} If required parameters are missing or invalid.
   */
  public async create(params: CreateGuildParams): Promise<Guild> {
    if (!params || typeof params !== "object") {
      throw new Error("params must be an object");
    }

    if (!params.name || typeof params.name !== "string" || !params.name.trim()) {
      throw new Error("name is required and must be a non-empty string");
    }

    if (
      !params.ownerAccount ||
      typeof params.ownerAccount !== "string" ||
      !params.ownerAccount.trim()
    ) {
      throw new Error("ownerAccount is required and must be a non-empty string");
    }

    const trimmedAccount = params.ownerAccount.trim();
    if (!isStellarAccountId(trimmedAccount)) {
      throw new Error(`Invalid Stellar account ID for ownerAccount: "${trimmedAccount}"`);
    }

    const body: Record<string, unknown> = {
      name: params.name.trim(),
      ownerAccount: trimmedAccount,
    };

    if (params.description !== undefined) {
      body.description = params.description;
    }
    if (params.contractId !== undefined) {
      body.contractId = params.contractId;
    }
    if (params.network !== undefined) {
      body.network = params.network;
    }
    if (params.metadata !== undefined) {
      body.metadata = params.metadata;
    }

    const response = await this.transport.request<Guild | { guild: Guild }>({
      method: "POST",
      path: "/guilds",
      headers: { ...this.defaultHeaders },
      body,
    });

    if (
      response &&
      typeof response === "object" &&
      "guild" in response &&
      (response as any).guild
    ) {
      return (response as any).guild as Guild;
    }
    return response as Guild;
  }

  /**
   * Updates an existing guild's attributes or metadata.
   *
   * @param guildId - Unique identifier of the guild to update.
   * @param params - Fields to modify.
   * @returns The updated Guild record.
   */
  public async update(guildId: string, params: UpdateGuildParams): Promise<Guild> {
    if (!guildId || typeof guildId !== "string" || !guildId.trim()) {
      throw new Error("guildId is required and must be a non-empty string");
    }

    if (!params || typeof params !== "object") {
      throw new Error("params must be an object");
    }

    const body: Record<string, unknown> = {};

    if (params.name !== undefined) {
      if (typeof params.name !== "string" || !params.name.trim()) {
        throw new Error("name must be a non-empty string if provided");
      }
      body.name = params.name.trim();
    }

    if (params.ownerAccount !== undefined) {
      const trimmedAccount = String(params.ownerAccount).trim();
      if (!isStellarAccountId(trimmedAccount)) {
        throw new Error(`Invalid Stellar account ID for ownerAccount: "${trimmedAccount}"`);
      }
      body.ownerAccount = trimmedAccount;
    }

    if (params.description !== undefined) {
      body.description = params.description;
    }
    if (params.contractId !== undefined) {
      body.contractId = params.contractId;
    }
    if (params.network !== undefined) {
      body.network = params.network;
    }
    if (params.metadata !== undefined) {
      body.metadata = params.metadata;
    }

    const path = `/guilds/${encodeURIComponent(guildId.trim())}`;
    const response = await this.transport.request<Guild | { guild: Guild }>({
      method: "PATCH",
      path,
      headers: { ...this.defaultHeaders },
      body,
    });

    if (
      response &&
      typeof response === "object" &&
      "guild" in response &&
      (response as any).guild
    ) {
      return (response as any).guild as Guild;
    }
    return response as Guild;
  }

  /**
   * Deletes a guild by identifier.
   *
   * @param guildId - The unique guild identifier.
   * @returns Result indicating deletion success.
   */
  public async delete(guildId: string): Promise<DeleteGuildResult> {
    if (!guildId || typeof guildId !== "string" || !guildId.trim()) {
      throw new Error("guildId is required and must be a non-empty string");
    }

    const path = `/guilds/${encodeURIComponent(guildId.trim())}`;
    await this.transport.request<{ success?: boolean } | null>({
      method: "DELETE",
      path,
      headers: { ...this.defaultHeaders },
    });

    return {
      id: guildId.trim(),
      deleted: true,
    };
  }

  /**
   * Iterates asynchronously over guilds across pages.
   *
   * @param params - Guild filter parameters (excluding cursor).
   * @param options - Paging configuration (e.g. maxPages limit).
   * @returns AsyncIterableIterator of Guild objects.
   */
  public paginate(
    params?: Omit<ListGuildsParams, "cursor">,
    options?: { maxPages?: number },
  ): AsyncIterable<Guild> {
    return paginate<Guild>(
      (pageReq) => this.list({ ...params, cursor: pageReq.cursor ?? undefined }),
      options,
    );
  }
}

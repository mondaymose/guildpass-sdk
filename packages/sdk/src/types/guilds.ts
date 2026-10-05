import type { Guild, Network } from "./domain.js";

/**
 * Parameters for creating a new guild / community in GuildPass.
 */
export interface CreateGuildParams {
  /** Human-readable display name for the community */
  name: string;
  /** Primary creator / owner Stellar account (G...) */
  ownerAccount: string;
  /** Optional community description */
  description?: string;
  /** Optional associated Soroban contract identifier */
  contractId?: string;
  /** Network on which the guild operates (defaults to 'testnet' if omitted) */
  network?: Network;
  /** Arbitrary community metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating an existing guild.
 */
export interface UpdateGuildParams {
  /** Updated human-readable display name */
  name?: string;
  /** Updated community description */
  description?: string;
  /** Updated owner Stellar account */
  ownerAccount?: string;
  /** Updated Soroban contract identifier */
  contractId?: string;
  /** Updated Stellar network */
  network?: Network;
  /** Updated community metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for querying and listing guilds with cursor pagination.
 */
export interface ListGuildsParams {
  /** Maximum number of records to return per page */
  limit?: number;
  /** Pagination cursor for fetching subsequent pages */
  cursor?: string;
  /** Filter guilds by owner Stellar account */
  ownerAccount?: string;
  /** Filter guilds by Stellar network */
  network?: Network;
}

/**
 * Result of deleting a guild.
 */
export interface DeleteGuildResult {
  /** ID of the deleted guild */
  id: string;
  /** Whether the guild was successfully deleted */
  deleted: boolean;
}

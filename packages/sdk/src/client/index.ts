import type {
  ValidatedConfig,
  LumenPassClientOptions,
  GuildPassClientOptions,
} from "@lumenpass/core";
import { parseConfig, HttpTransport } from "@lumenpass/core";
import { AccessResource } from "../resources/access.js";
import { GuildsResource } from "../resources/guilds.js";

export type { LumenPassClientOptions, GuildPassClientOptions } from "@lumenpass/core";

export class LumenPassClient {
  private readonly config: ValidatedConfig;
  private readonly transport: HttpTransport;
  public readonly access: AccessResource;
  public readonly guilds: GuildsResource;

  constructor(options: LumenPassClientOptions) {
    this.config = parseConfig(options);
    this.transport = new HttpTransport({
      baseUrl: this.config.baseUrl,
      defaultTimeoutMs: this.config.timeoutMs,
    });
    this.access = new AccessResource(this.transport, this.config.headers);
    this.guilds = new GuildsResource(this.transport, this.config.headers);
  }

  /**
   * Get the normalized base URL.
   */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get the validated timeout in milliseconds.
   */
  get timeoutMs(): number {
    return this.config.timeoutMs;
  }

  /**
   * Get the normalized headers (readonly).
   */
  get headers(): Readonly<Record<string, string>> {
    return this.config.headers;
  }

  /**
   * Get the internal validated configuration.
   * This is exposed for internal SDK use only.
   */
  get _internalConfig(): ValidatedConfig {
    return this.config;
  }

  /**
   * Get the internal transport instance.
   * This is exposed for internal SDK or testing use only.
   */
  get _internalTransport(): HttpTransport {
    return this.transport;
  }
}

export { LumenPassClient as GuildPassClient };


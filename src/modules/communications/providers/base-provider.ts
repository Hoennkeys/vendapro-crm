import type { ProviderConnectionStatus } from "./communication-provider.interface";

export abstract class BaseProvider {
  protected config: import("../domain/entities").ProviderConfig | null = null;

  protected ok(message?: string): ProviderConnectionStatus {
    return {
      status: "connected",
      message,
      lastSyncAt: new Date().toISOString(),
    };
  }

  protected err(message: string): ProviderConnectionStatus {
    return { status: "error", message };
  }

  protected disconnected(): ProviderConnectionStatus {
    return { status: "disconnected" };
  }
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

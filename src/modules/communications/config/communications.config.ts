export type CommunicationsStorageProvider = "local" | "drizzle";
export type CommunicationsRealtimeProvider = "polling" | "websocket";

const DEMO_TENANT_ID = "tenant-demo";

function readEnv(key: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const value = import.meta.env[key];
    return typeof value === "string" ? value : undefined;
  }
  return process.env[key];
}

export function getCommunicationsStorageProvider(): CommunicationsStorageProvider {
  const value = readEnv("VITE_COMMUNICATIONS_STORAGE_PROVIDER");
  return value === "drizzle" ? "drizzle" : "local";
}

export function getCommunicationsRealtimeProvider(): CommunicationsRealtimeProvider {
  const value = readEnv("VITE_COMMUNICATIONS_REALTIME_PROVIDER");
  return value === "websocket" ? "websocket" : "polling";
}

/** Mock channel conversations only in demo contexts — never in production by default. */
export function shouldIncludeMockConversations(tenantId: string): boolean {
  if (readEnv("VITE_DEMO_MODE") === "true") return true;
  if (tenantId === DEMO_TENANT_ID) return true;
  return false;
}

export function getCommunicationsWebSocketUrl(): string | undefined {
  const url = readEnv("VITE_COMMUNICATIONS_WS_URL");
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

export function isDevEnvironment(): boolean {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.DEV === true;
  }
  return process.env.NODE_ENV !== "production";
}

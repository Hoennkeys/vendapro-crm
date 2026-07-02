import type { RealtimeEvent, RealtimeService } from "./realtime.interface";

export class PollingRealtimeService implements RealtimeService {
  private handlers = new Map<string, Set<(event: RealtimeEvent) => void>>();
  private tenantId: string | null = null;

  async connect(tenantId: string) {
    this.tenantId = tenantId;
  }

  disconnect() {
    this.handlers.clear();
    this.tenantId = null;
  }

  subscribe(channel: string, handler: (event: RealtimeEvent) => void) {
    if (!this.handlers.has(channel)) this.handlers.set(channel, new Set());
    this.handlers.get(channel)!.add(handler);
    return () => this.handlers.get(channel)?.delete(handler);
  }

  publish(channel: string, event: RealtimeEvent) {
    this.handlers.get(channel)?.forEach((h) => h(event));
  }

  getTenantId() {
    return this.tenantId;
  }
}

let instance: PollingRealtimeService | null = null;

export function getPollingRealtimeService(): PollingRealtimeService {
  if (!instance) instance = new PollingRealtimeService();
  return instance;
}

import type { RealtimeService } from "./realtime.interface";

export class SupabaseRealtimeService implements RealtimeService {
  async connect(_tenantId: string) {}
  disconnect() {}
  subscribe(_channel: string, _handler: (event: import("./realtime.interface").RealtimeEvent) => void) {
    return () => {};
  }
  publish() {}
}

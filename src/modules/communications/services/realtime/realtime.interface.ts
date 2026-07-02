export type RealtimeEventType =
  | "message.created"
  | "conversation.updated"
  | "ticket.status_changed"
  | "provider.status_changed";

export interface RealtimeEvent {
  type: RealtimeEventType;
  tenantId: string;
  payload: unknown;
}

export interface RealtimeService {
  connect(tenantId: string): Promise<void>;
  disconnect(): void;
  subscribe(channel: string, handler: (event: RealtimeEvent) => void): () => void;
  publish(channel: string, event: RealtimeEvent): void;
}

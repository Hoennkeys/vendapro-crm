import { getCommunicationsWebSocketUrl } from "../../config/communications.config";
import { commsDevLog, commsDevWarn } from "../../lib/dev-diagnostics";
import { getPollingRealtimeService } from "./polling-realtime.service";
import type { RealtimeEvent, RealtimeService } from "./realtime.interface";

const CONNECT_TIMEOUT_MS = 3000;

export class WebSocketRealtimeService implements RealtimeService {
  private handlers = new Map<string, Set<(event: RealtimeEvent) => void>>();
  private fallback = getPollingRealtimeService();
  private ws: WebSocket | null = null;
  private tenantId: string | null = null;
  private useFallback = false;

  async connect(tenantId: string) {
    this.tenantId = tenantId;
    const url = getCommunicationsWebSocketUrl();

    if (typeof WebSocket === "undefined" || !url) {
      commsDevWarn("websocket URL missing — falling back to polling");
      this.useFallback = true;
      await this.fallback.connect(tenantId);
      return;
    }

    try {
      await this.connectWebSocket(url, tenantId);
      commsDevLog("websocket connected", { tenantId, url });
    } catch (error) {
      commsDevWarn("websocket connect failed — falling back to polling", error);
      this.useFallback = true;
      await this.fallback.connect(tenantId);
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
    this.fallback.disconnect();
    this.tenantId = null;
    this.useFallback = false;
  }

  subscribe(channel: string, handler: (event: RealtimeEvent) => void) {
    if (this.useFallback) return this.fallback.subscribe(channel, handler);

    if (!this.handlers.has(channel)) this.handlers.set(channel, new Set());
    this.handlers.get(channel)!.add(handler);
    return () => this.handlers.get(channel)?.delete(handler);
  }

  publish(channel: string, event: RealtimeEvent) {
    if (this.useFallback) {
      this.fallback.publish(channel, event);
      return;
    }

    this.handlers.get(channel)?.forEach((handler) => handler(event));

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ channel, event }));
    }
  }

  private connectWebSocket(url: string, tenantId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${url}?tenantId=${encodeURIComponent(tenantId)}`);
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        ws.close();
        reject(new Error("websocket connect timeout"));
      }, CONNECT_TIMEOUT_MS);

      ws.onopen = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.ws = ws;
        resolve();
      };

      ws.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(new Error("websocket error"));
      };

      ws.onmessage = (message) => {
        try {
          const parsed = JSON.parse(String(message.data)) as {
            channel?: string;
            event?: RealtimeEvent;
          };
          if (parsed.channel && parsed.event) {
            this.handlers.get(parsed.channel)?.forEach((handler) => handler(parsed.event!));
          }
        } catch {
          // ignore malformed payloads — polling/query refetch remains source of truth
        }
      };

      ws.onclose = () => {
        if (!this.useFallback && this.tenantId) {
          commsDevWarn("websocket closed — falling back to polling");
          this.useFallback = true;
          void this.fallback.connect(this.tenantId);
        }
      };
    });
  }
}

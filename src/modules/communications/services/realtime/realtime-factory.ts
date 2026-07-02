import {
  getCommunicationsRealtimeProvider,
  type CommunicationsRealtimeProvider,
} from "../../config/communications.config";
import { commsDevLog, commsDevWarn } from "../../lib/dev-diagnostics";
import { getPollingRealtimeService } from "./polling-realtime.service";
import { WebSocketRealtimeService } from "./websocket-realtime.service";
import type { RealtimeService } from "./realtime.interface";

let cached: RealtimeService | null = null;
let cachedProvider: CommunicationsRealtimeProvider | null = null;

export function createRealtimeService(): RealtimeService {
  const provider = getCommunicationsRealtimeProvider();

  if (cached && cachedProvider === provider) {
    return cached;
  }

  commsDevLog("realtime provider", { provider });

  if (provider === "websocket") {
    cached = new WebSocketRealtimeService();
    cachedProvider = provider;
    return cached;
  }

  cached = getPollingRealtimeService();
  cachedProvider = provider;
  return cached;
}

export function resetRealtimeServiceForTests() {
  cached?.disconnect();
  cached = null;
  cachedProvider = null;
}

export function warnIfRealtimeUnavailable(provider: CommunicationsRealtimeProvider, reason: string) {
  if (provider === "websocket") {
    commsDevWarn(`websocket unavailable — ${reason}`);
  }
}

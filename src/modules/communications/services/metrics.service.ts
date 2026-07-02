import { computeMetrics } from "../domain/metrics";
import type { CommunicationsSnapshot, Conversation } from "../domain/entities";

export function getCommunicationsMetrics(
  snapshot: CommunicationsSnapshot,
  conversations: Conversation[],
  slaThresholdMs?: number,
) {
  return computeMetrics(snapshot, conversations, slaThresholdMs);
}

export { computeMetrics, countUnread } from "../domain/metrics";

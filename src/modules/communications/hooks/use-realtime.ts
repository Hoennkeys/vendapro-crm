import { useCommunications } from "../store/communications-context";

export function useRealtimeSubscription(
  handler: (event: import("../services/realtime/realtime.interface").RealtimeEvent) => void,
) {
  const { hub } = useCommunications();
  return hub.subscribe(handler);
}

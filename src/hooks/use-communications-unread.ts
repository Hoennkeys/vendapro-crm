import { useCrm } from "@/lib/crm-store";

/** Unread badge for sidebar — works outside CommunicationsProvider */
export function useCommunicationsUnread(): number {
  const crm = useCrm();
  const fromConversas = crm.conversas.reduce((acc, c) => acc + c.naoLidas, 0);
  const fromComms =
    crm.communications?.conversations?.reduce((acc, c) => acc + c.unreadCount, 0) ?? 0;
  return Math.max(fromConversas, fromComms);
}

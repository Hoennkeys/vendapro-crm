import { useQuery } from "@tanstack/react-query";
import { useCommunications } from "../../store/communications-context";
import type { ConversationFilters } from "../../types/provider.types";

export function useInbox(filters?: ConversationFilters) {
  const { hub, tenantId, visibleConversations, role, refresh } = useCommunications();

  const query = useQuery({
    queryKey: ["communications", tenantId, "inbox", filters],
    queryFn: () => {
      const all = hub.listConversations(filters);
      if (!role) return all;
      const ids = new Set(visibleConversations.map((c) => c.id));
      return all.filter((c) => ids.has(c.id));
    },
    refetchInterval: 5000,
  });

  return { ...query, refresh };
}

export function useConversationMessages(conversationId: string | undefined) {
  const { hub, tenantId, filterMessages, role } = useCommunications();

  return useQuery({
    queryKey: ["communications", tenantId, "messages", conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      const msgs = hub.getMessages(conversationId);
      return role ? filterMessages(role, msgs) : msgs;
    },
    enabled: Boolean(conversationId),
    refetchInterval: 5000,
  });
}

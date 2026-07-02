import type { InboxSearch, LegacyComunicacaoSearch } from "../types/conversation.types";

export function mapLegacySearch(search: LegacyComunicacaoSearch): InboxSearch {
  return {
    channel: search.tab === "emails" ? "email" : undefined,
    chamadoId: search.chamadoId,
    clientId: search.clientId,
    conversationId: search.chatId,
  };
}

export function mapLegacyChatsSearch(): InboxSearch {
  return { channel: "internal" };
}

export function mapLegacyEmailsSearch(): InboxSearch {
  return { channel: "email" };
}

export function inboxSearchToRecord(search: InboxSearch): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  if (search.channel) out.channel = search.channel;
  if (search.chamadoId) out.chamadoId = search.chamadoId;
  if (search.clientId) out.clientId = search.clientId;
  if (search.conversationId) out.conversationId = search.conversationId;
  if (search.ticketId) out.ticketId = search.ticketId;
  if (search.q) out.q = search.q;
  return out;
}

export function parseInboxSearch(search: Record<string, unknown>): InboxSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const channel = str(search.channel);
  const validChannels = [
    "internal",
    "email",
    "whatsapp",
    "slack",
    "crisp",
    "telegram",
    "discord",
    "teams",
    "webchat",
  ] as const;
  return {
    channel: validChannels.includes(channel as (typeof validChannels)[number])
      ? (channel as InboxSearch["channel"])
      : undefined,
    chamadoId: str(search.chamadoId),
    clientId: str(search.clientId),
    conversationId: str(search.conversationId),
    ticketId: str(search.ticketId),
    q: str(search.q),
  };
}

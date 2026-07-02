import type { CommunicationChannelType } from "../domain/entities";

export interface InboxSearch {
  channel?: CommunicationChannelType;
  chamadoId?: string;
  clientId?: string;
  conversationId?: string;
  ticketId?: string;
  q?: string;
}

export type ComunicacaoTab = "chats" | "emails";

export interface LegacyComunicacaoSearch {
  tab: ComunicacaoTab;
  chamadoId?: string;
  clientId?: string;
  chatId?: string;
}

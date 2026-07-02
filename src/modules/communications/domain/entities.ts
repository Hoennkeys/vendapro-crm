export type CommunicationChannelType =
  | "internal"
  | "email"
  | "whatsapp"
  | "slack"
  | "crisp"
  | "telegram"
  | "discord"
  | "teams"
  | "webchat";

export type ParticipantRole = "admin" | "employee" | "client" | "system" | "external";

export type ProviderStatus = "disconnected" | "connecting" | "connected" | "error";

export type ConversationStatus = "open" | "pending" | "closed";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high";

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  email?: string;
  phone?: string;
  externalId?: string;
}

export interface ProviderConfig {
  id: string;
  tenantId: string;
  type: CommunicationChannelType;
  enabled: boolean;
  credentials: Record<string, string>;
  webhookUrl?: string;
  status: ProviderStatus;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface Channel {
  id: string;
  providerId: string;
  externalId?: string;
  name: string;
  type: CommunicationChannelType;
}

export interface Conversation {
  id: string;
  tenantId: string;
  channelId: string;
  channelType: CommunicationChannelType;
  subject?: string;
  participants: Participant[];
  assignedEmployeeId?: string;
  clientId?: string;
  leadId?: string;
  ticketId?: string;
  unreadCount: number;
  lastMessageAt: string;
  status: ConversationStatus;
  tags: string[];
  /** Legacy link to Conversa.id */
  legacyConversaId?: string;
  /** Legacy link to EmailMsg.id */
  legacyEmailId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  authorRole: ParticipantRole;
  body: string;
  bodyHtml?: string;
  sentAt: string;
  readAt?: string;
  externalId?: string;
  metadata?: Record<string, unknown>;
  isInternalNote: boolean;
}

export interface Attachment {
  id: string;
  messageId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  clientId: string;
  assignedEmployeeId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  /** Legacy link to Chamado.id */
  legacyChamadoId?: string;
}

export interface InternalNote {
  id: string;
  ticketId?: string;
  conversationId: string;
  authorId: string;
  body: string;
  createdAt: string;
  visibleToRoles: ("admin" | "employee")[];
}

export interface CommunicationsSnapshot {
  migratedV1?: boolean;
  providers: ProviderConfig[];
  channels: Channel[];
  conversations: Conversation[];
  messages: Message[];
  tickets: Ticket[];
  internalNotes: InternalNote[];
  attachments: Attachment[];
}

export const EMPTY_COMMUNICATIONS_SNAPSHOT: CommunicationsSnapshot = {
  providers: [],
  channels: [],
  conversations: [],
  messages: [],
  tickets: [],
  internalNotes: [],
  attachments: [],
};

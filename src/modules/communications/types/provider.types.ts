import type { CommunicationChannelType, ProviderConfig, ProviderStatus } from "../domain/entities";

export interface ProviderConnectionStatus {
  status: ProviderStatus;
  message?: string;
  lastSyncAt?: string;
}

export interface SendMessageInput {
  conversationId: string;
  body: string;
  attachments?: File[];
  metadata?: Record<string, unknown>;
  isInternalNote?: boolean;
}

export interface CreateConversationInput {
  channelType: CommunicationChannelType;
  subject?: string;
  clientId?: string;
  leadId?: string;
  assignedEmployeeId?: string;
  participants?: ProviderConfig extends never ? never : import("../domain/entities").Participant[];
}

export interface ConversationFilters {
  channelType?: CommunicationChannelType;
  status?: import("../domain/entities").ConversationStatus;
  assignedEmployeeId?: string;
  clientId?: string;
  search?: string;
}

export type { ProviderConfig, CommunicationChannelType };

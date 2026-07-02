import type {
  CommunicationChannelType,
  Conversation,
  Message,
  Participant,
  ProviderConfig,
} from "../domain/entities";

export interface ProviderConnectionStatus {
  status: ProviderConfig["status"];
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
  participants?: Participant[];
}

export interface ConversationFilters {
  channelType?: CommunicationChannelType;
  status?: Conversation["status"];
  assignedEmployeeId?: string;
  clientId?: string;
  search?: string;
}

export interface CommunicationProvider {
  readonly type: CommunicationChannelType;
  connect(config: ProviderConfig): Promise<ProviderConnectionStatus>;
  disconnect(): Promise<void>;
  getStatus(): Promise<ProviderConnectionStatus>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  receiveMessage(payload: unknown): Promise<Message>;
  getConversations(filters?: ConversationFilters): Promise<Conversation[]>;
  createConversation(input: CreateConversationInput): Promise<Conversation>;
  getContacts(query?: string): Promise<Participant[]>;
}

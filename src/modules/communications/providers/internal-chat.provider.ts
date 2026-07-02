import type { CommunicationProvider, CreateConversationInput, SendMessageInput } from "./communication-provider.interface";
import type { Conversation, Message, ProviderConfig } from "../domain/entities";
import { BaseProvider, uid } from "./base-provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

export class InternalChatProvider extends BaseProvider implements CommunicationProvider {
  readonly type = "internal" as const;

  constructor(private repos: LocalCommunicationsRepositories) {
    super();
  }

  async connect(config: ProviderConfig) {
    this.config = config;
    return this.ok("Chat interno ativo");
  }

  async disconnect() {
    this.config = null;
  }

  async getStatus() {
    return this.config ? this.ok() : this.disconnected();
  }

  async getConversations() {
    return this.repos.conversationRepo.list({ channelType: "internal" });
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const channel = this.repos.providerRepo.getByType("internal");
    const conv: Conversation = {
      id: uid("conv"),
      tenantId: this.config?.tenantId ?? "",
      channelId: channel?.id ?? "channel_internal",
      channelType: "internal",
      subject: input.subject ?? "Nova conversa",
      participants: input.participants ?? [],
      assignedEmployeeId: input.assignedEmployeeId,
      clientId: input.clientId,
      leadId: input.leadId,
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      status: "open",
      tags: [],
    };
    this.repos.conversationRepo.save(conv);
    return conv;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const msg: Message = {
      id: uid("msg"),
      conversationId: input.conversationId,
      authorId: "current-user",
      authorRole: input.isInternalNote ? "employee" : "employee",
      body: input.body,
      sentAt: new Date().toISOString(),
      metadata: input.metadata,
      isInternalNote: input.isInternalNote ?? false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async receiveMessage(_payload: unknown): Promise<Message> {
    throw new Error("Internal chat does not use webhooks");
  }

  async getContacts(query?: string) {
    const convs = await this.getConversations();
    const participants = convs.flatMap((c) => c.participants);
    if (!query) return participants;
    const q = query.toLowerCase();
    return participants.filter((p) => p.name.toLowerCase().includes(q));
  }
}

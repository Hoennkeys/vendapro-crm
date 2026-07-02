import type { CommunicationProvider, CreateConversationInput, SendMessageInput } from "./communication-provider.interface";
import type { Conversation, Message, ProviderConfig } from "../domain/entities";
import { BaseProvider, uid } from "./base-provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

const CRISP_API = "https://api.crisp.chat/v1";

export class CrispProvider extends BaseProvider implements CommunicationProvider {
  readonly type = "crisp" as const;

  constructor(private repos: LocalCommunicationsRepositories) {
    super();
  }

  private authHeader() {
    const { identifier, key } = this.config?.credentials ?? {};
    if (!identifier || !key) return null;
    const token = btoa(`${identifier}:${key}`);
    return `Basic ${token}`;
  }

  async connect(config: ProviderConfig) {
    this.config = config;
    const { websiteId } = config.credentials;
    const auth = this.authHeader();
    if (!websiteId || !auth) return this.ok("Modo demo — configure websiteId, identifier e key");

    try {
      const res = await fetch(`${CRISP_API}/website/${websiteId}`, {
        headers: { Authorization: auth, "X-Crisp-Tier": "plugin" },
      });
      if (!res.ok) return this.err(`Crisp API: ${res.status}`);
      return this.ok("Crisp conectado");
    } catch (e) {
      return this.err(e instanceof Error ? e.message : "Erro Crisp");
    }
  }

  async disconnect() {
    this.config = null;
  }

  async getStatus() {
    return this.config ? this.ok() : this.disconnected();
  }

  async getConversations() {
    return this.repos.conversationRepo.list({ channelType: "crisp" });
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const channel = this.repos.providerRepo.getByType("crisp");
    const conv: Conversation = {
      id: uid("conv_crisp"),
      tenantId: this.config?.tenantId ?? "",
      channelId: channel?.id ?? "channel_crisp",
      channelType: "crisp",
      subject: input.subject ?? "Crisp Inbox",
      participants: input.participants ?? [],
      clientId: input.clientId,
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      status: "open",
      tags: [],
    };
    this.repos.conversationRepo.save(conv);
    return conv;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const { websiteId } = this.config?.credentials ?? {};
    const sessionId = String(input.metadata?.sessionId ?? "");
    const auth = this.authHeader();

    if (websiteId && sessionId && auth) {
      await fetch(
        `${CRISP_API}/website/${websiteId}/conversation/${sessionId}/message`,
        {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
            "X-Crisp-Tier": "plugin",
          },
          body: JSON.stringify({ type: "text", content: input.body, from: "operator" }),
        },
      );
    }

    const msg: Message = {
      id: uid("msg_crisp"),
      conversationId: input.conversationId,
      authorId: "crisp-operator",
      authorRole: "employee",
      body: input.body,
      sentAt: new Date().toISOString(),
      metadata: input.metadata,
      isInternalNote: false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async receiveMessage(payload: unknown): Promise<Message> {
    const data = payload as { conversationId: string; from: string; content: string };
    const msg: Message = {
      id: uid("msg_crisp"),
      conversationId: data.conversationId,
      authorId: data.from,
      authorRole: "client",
      body: data.content,
      sentAt: new Date().toISOString(),
      isInternalNote: false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async getContacts(query?: string) {
    const convs = await this.getConversations();
    const parts = convs.flatMap((c) => c.participants);
    if (!query) return parts;
    const q = query.toLowerCase();
    return parts.filter((p) => p.name.toLowerCase().includes(q));
  }
}

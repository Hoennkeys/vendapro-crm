import type { CommunicationProvider, CreateConversationInput, SendMessageInput } from "./communication-provider.interface";
import type { Conversation, Message, ProviderConfig } from "../domain/entities";
import { BaseProvider, uid } from "./base-provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

export class EmailProvider extends BaseProvider implements CommunicationProvider {
  readonly type = "email" as const;

  constructor(private repos: LocalCommunicationsRepositories) {
    super();
  }

  async connect(config: ProviderConfig) {
    this.config = config;
    const hasSmtp = Boolean(config.credentials.smtpHost || config.credentials.smtpUsuario);
    return hasSmtp ? this.ok("SMTP configurado") : this.ok("Modo demo — e-mails locais");
  }

  async disconnect() {
    this.config = null;
  }

  async getStatus() {
    return this.config ? this.ok() : this.disconnected();
  }

  async getConversations() {
    return this.repos.conversationRepo.list({ channelType: "email" });
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const channel = this.repos.providerRepo.getByType("email");
    const conv: Conversation = {
      id: uid("conv_email"),
      tenantId: this.config?.tenantId ?? "",
      channelId: channel?.id ?? "channel_email",
      channelType: "email",
      subject: input.subject ?? "Novo e-mail",
      participants: input.participants ?? [],
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      status: "open",
      tags: ["Rascunhos"],
    };
    this.repos.conversationRepo.save(conv);
    return conv;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const meta = input.metadata ?? {};
    const msg: Message = {
      id: uid("msg_email"),
      conversationId: input.conversationId,
      authorId: String(meta.from ?? "sistema@vendapro.app"),
      authorRole: "employee",
      body: input.body,
      sentAt: new Date().toISOString(),
      metadata: { ...meta, pasta: "Enviados" },
      isInternalNote: false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async receiveMessage(payload: unknown): Promise<Message> {
    const data = payload as { conversationId: string; from: string; body: string; subject?: string };
    const msg: Message = {
      id: uid("msg_email"),
      conversationId: data.conversationId,
      authorId: data.from,
      authorRole: "external",
      body: data.body,
      sentAt: new Date().toISOString(),
      metadata: { assunto: data.subject, pasta: "Caixa de Entrada" },
      isInternalNote: false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async getContacts(query?: string) {
    const convs = await this.getConversations();
    const emails = convs.flatMap((c) =>
      c.participants.filter((p) => p.email).map((p) => p),
    );
    if (!query) return emails;
    const q = query.toLowerCase();
    return emails.filter((p) => (p.email ?? p.name).toLowerCase().includes(q));
  }
}

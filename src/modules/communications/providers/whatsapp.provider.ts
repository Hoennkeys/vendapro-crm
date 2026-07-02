import type { CommunicationProvider, CreateConversationInput, SendMessageInput } from "./communication-provider.interface";
import type { Conversation, Message, ProviderConfig } from "../domain/entities";
import { BaseProvider, uid } from "./base-provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

const GRAPH_API = "https://graph.facebook.com/v21.0";

export class WhatsAppProvider extends BaseProvider implements CommunicationProvider {
  readonly type = "whatsapp" as const;

  constructor(private repos: LocalCommunicationsRepositories) {
    super();
  }

  async connect(config: ProviderConfig) {
    this.config = config;
    const { accessToken, phoneNumberId } = config.credentials;
    if (!accessToken || !phoneNumberId) {
      return this.ok("Modo demo — configure accessToken e phoneNumberId");
    }
    try {
      const res = await fetch(`${GRAPH_API}/${phoneNumberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return this.err(`WhatsApp API: ${res.status}`);
      return this.ok("WhatsApp Cloud API conectado");
    } catch (e) {
      return this.err(e instanceof Error ? e.message : "Erro de conexão");
    }
  }

  async disconnect() {
    this.config = null;
  }

  async getStatus() {
    return this.config?.status === "connected" ? this.ok() : this.disconnected();
  }

  async getConversations() {
    return this.repos.conversationRepo.list({ channelType: "whatsapp" });
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const channel = this.repos.providerRepo.getByType("whatsapp");
    const conv: Conversation = {
      id: uid("conv_wa"),
      tenantId: this.config?.tenantId ?? "",
      channelId: channel?.id ?? "channel_whatsapp",
      channelType: "whatsapp",
      subject: input.subject ?? "WhatsApp",
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
    const { accessToken, phoneNumberId } = this.config?.credentials ?? {};
    const to = String(input.metadata?.to ?? "");

    if (accessToken && phoneNumberId && to) {
      await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: input.body },
        }),
      });
    }

    const msg: Message = {
      id: uid("msg_wa"),
      conversationId: input.conversationId,
      authorId: "whatsapp-agent",
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
    const body = payload as {
      conversationId: string;
      from: string;
      text: string;
      externalId?: string;
    };
    const msg: Message = {
      id: uid("msg_wa"),
      conversationId: body.conversationId,
      authorId: body.from,
      authorRole: "client",
      body: body.text,
      sentAt: new Date().toISOString(),
      externalId: body.externalId,
      isInternalNote: false,
    };
    this.repos.messageRepo.save(msg);
    return msg;
  }

  async sendTemplate(
    to: string,
    templateName: string,
    language = "pt_BR",
  ): Promise<void> {
    const { accessToken, phoneNumberId } = this.config?.credentials ?? {};
    if (!accessToken || !phoneNumberId) return;
    await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: templateName, language: { code: language } },
      }),
    });
  }

  async getContacts(query?: string) {
    const convs = await this.getConversations();
    const contacts = convs.flatMap((c) => c.participants.filter((p) => p.phone));
    if (!query) return contacts;
    const q = query.toLowerCase();
    return contacts.filter((p) => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }
}

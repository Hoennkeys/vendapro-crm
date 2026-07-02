import type { CommunicationProvider, CreateConversationInput, SendMessageInput } from "./communication-provider.interface";
import type { Conversation, Message, ProviderConfig } from "../domain/entities";
import { BaseProvider, uid } from "./base-provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

export class SlackProvider extends BaseProvider implements CommunicationProvider {
  readonly type = "slack" as const;

  constructor(private repos: LocalCommunicationsRepositories) {
    super();
  }

  async connect(config: ProviderConfig) {
    this.config = config;
    const { botToken } = config.credentials;
    if (!botToken) return this.ok("Modo demo — configure botToken");

    try {
      const res = await fetch("https://slack.com/api/auth.test", {
        headers: { Authorization: `Bearer ${botToken}` },
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) return this.err(data.error ?? "Slack auth failed");
      return this.ok(`Slack conectado`);
    } catch (e) {
      return this.err(e instanceof Error ? e.message : "Erro Slack");
    }
  }

  async disconnect() {
    this.config = null;
  }

  async getStatus() {
    return this.config ? this.ok() : this.disconnected();
  }

  async getConversations() {
    return this.repos.conversationRepo.list({ channelType: "slack" });
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const channel = this.repos.providerRepo.getByType("slack");
    const conv: Conversation = {
      id: uid("conv_slack"),
      tenantId: this.config?.tenantId ?? "",
      channelId: channel?.id ?? "channel_slack",
      channelType: "slack",
      subject: input.subject ?? "#geral",
      participants: input.participants ?? [],
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      status: "open",
      tags: [],
    };
    this.repos.conversationRepo.save(conv);
    return conv;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const { botToken } = this.config?.credentials ?? {};
    const channelId = String(input.metadata?.slackChannelId ?? "");

    if (botToken && channelId) {
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel: channelId, text: input.body }),
      });
    }

    const msg: Message = {
      id: uid("msg_slack"),
      conversationId: input.conversationId,
      authorId: "slack-bot",
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
    const data = payload as { conversationId: string; user: string; text: string };
    const msg: Message = {
      id: uid("msg_slack"),
      conversationId: data.conversationId,
      authorId: data.user,
      authorRole: "external",
      body: data.text,
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

import { buildChamadoGreetingMessage } from "@/lib/comunicacao/chamado-greeting";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";
import { ProviderRegistry } from "../providers/provider-registry";
import type { SendMessageInput } from "../providers/communication-provider.interface";
import type { CommunicationChannelType, InternalNote, Ticket } from "../domain/entities";
import { uid } from "../providers/base-provider";
import { createRealtimeService } from "./realtime/realtime-factory";
import { commsDevLog } from "../lib/dev-diagnostics";

export class CommunicationHubService {
  registry: ProviderRegistry;
  private realtime = createRealtimeService();

  constructor(
    private tenantId: string,
    private repos: LocalCommunicationsRepositories,
  ) {
    this.registry = new ProviderRegistry(repos);
  }

  async init() {
    await this.realtime.connect(this.tenantId);
    await this.registry.connectAll();
    commsDevLog("hub initialized", { tenantId: this.tenantId });
  }

  getProvider(type: CommunicationChannelType) {
    return this.registry.get(type);
  }

  listConversations(filters?: Parameters<LocalCommunicationsRepositories["conversationRepo"]["list"]>[0]) {
    return this.repos.conversationRepo.list(filters);
  }

  getMessages(conversationId: string) {
    return this.repos.messageRepo.listByConversation(conversationId);
  }

  async sendMessage(type: CommunicationChannelType, input: SendMessageInput) {
    const provider = this.registry.get(type);
    const msg = await provider.sendMessage(input);
    this.realtime.publish(`tenant:${this.tenantId}`, {
      type: "message.created",
      tenantId: this.tenantId,
      payload: msg,
    });
    return msg;
  }

  markConversationRead(conversationId: string) {
    this.repos.messageRepo.markRead(conversationId);
    this.realtime.publish(`tenant:${this.tenantId}`, {
      type: "conversation.updated",
      tenantId: this.tenantId,
      payload: { conversationId },
    });
  }

  addInternalNote(input: {
    conversationId: string;
    ticketId?: string;
    authorId: string;
    body: string;
  }) {
    const note: InternalNote = {
      id: uid("note"),
      conversationId: input.conversationId,
      ticketId: input.ticketId,
      authorId: input.authorId,
      body: input.body,
      createdAt: new Date().toISOString(),
      visibleToRoles: ["admin", "employee"],
    };
    this.repos.addInternalNote(note);
    return note;
  }

  listTickets() {
    return this.repos.ticketRepo.list();
  }

  updateTicketStatus(ticketId: string, status: Ticket["status"]) {
    this.repos.ticketRepo.updateStatus(ticketId, status);
    this.realtime.publish(`tenant:${this.tenantId}`, {
      type: "ticket.status_changed",
      tenantId: this.tenantId,
      payload: { ticketId, status },
    });
  }

  buildChamadoGreeting(clientName: string, chamadoTitle: string) {
    return buildChamadoGreetingMessage(clientName, chamadoTitle);
  }

  subscribe(handler: (event: import("./realtime/realtime.interface").RealtimeEvent) => void) {
    return this.realtime.subscribe(`tenant:${this.tenantId}`, handler);
  }

  updateProvider(id: string, patch: Partial<import("../domain/entities").ProviderConfig>) {
    this.repos.providerRepo.update(id, patch);
    this.realtime.publish(`tenant:${this.tenantId}`, {
      type: "provider.status_changed",
      tenantId: this.tenantId,
      payload: { id, ...patch },
    });
  }

  listProviders() {
    return this.repos.providerRepo.list();
  }

  getChannels() {
    return this.repos.conversationRepo.getSnapshot().channels;
  }
}

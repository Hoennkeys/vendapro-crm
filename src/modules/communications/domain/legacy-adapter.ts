import type { Chamado, Conversa, EmailMsg, Mensagem } from "@/lib/types";
import { shouldIncludeMockConversations } from "../config/communications.config";
import { commsDevLog } from "../lib/dev-diagnostics";
import { syncTicketsFromChamados } from "./chamado-ticket-sync";
import type {
  Channel,
  CommunicationsSnapshot,
  Conversation,
  Message,
  Participant,
  ProviderConfig,
  Ticket,
} from "./entities";
import { EMPTY_COMMUNICATIONS_SNAPSHOT } from "./entities";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_PROVIDER_TYPES = [
  "internal",
  "email",
  "whatsapp",
  "slack",
  "crisp",
  "telegram",
  "discord",
  "teams",
] as const;

export function createDefaultProviders(tenantId: string): ProviderConfig[] {
  return DEFAULT_PROVIDER_TYPES.map((type) => ({
    id: `provider_${type}_${tenantId}`,
    tenantId,
    type,
    enabled: type === "internal" || type === "email",
    credentials: {},
    status: type === "internal" ? "connected" : "disconnected",
  }));
}

export function createDefaultChannels(providers: ProviderConfig[]): Channel[] {
  return providers.map((p) => ({
    id: `channel_${p.type}`,
    providerId: p.id,
    name: p.type === "internal" ? "Chat interno" : p.type.charAt(0).toUpperCase() + p.type.slice(1),
    type: p.type,
  }));
}

function mensagemAutorToRole(autor: Mensagem["autor"]): Participant["role"] {
  return autor === "cliente" ? "client" : "employee";
}

export function conversaToConversation(
  conversa: Conversa,
  tenantId: string,
  channelId: string,
): Conversation {
  const lastMsg = conversa.mensagens[conversa.mensagens.length - 1];
  return {
    id: `conv_legacy_${conversa.id}`,
    tenantId,
    channelId,
    channelType: "internal",
    subject: conversa.contatoNome,
    participants: [
      {
        id: conversa.agenteId,
        name: conversa.contatoNome,
        role: "employee",
      },
      {
        id: conversa.leadId ?? `client_${conversa.contatoNome}`,
        name: conversa.contatoNome,
        role: "client",
        phone: conversa.telefone,
      },
    ],
    assignedEmployeeId: conversa.agenteId,
    clientId: undefined,
    leadId: conversa.leadId,
    unreadCount: conversa.naoLidas,
    lastMessageAt: lastMsg?.em ?? new Date().toISOString(),
    status: "open",
    tags: [],
    legacyConversaId: conversa.id,
  };
}

export function mensagensToMessages(
  conversa: Conversa,
  conversationId: string,
): Message[] {
  return conversa.mensagens.map((m) => ({
    id: `msg_legacy_${m.id}`,
    conversationId,
    authorId: m.autor === "cliente" ? "client" : conversa.agenteId,
    authorRole: mensagemAutorToRole(m.autor),
    body: m.texto,
    sentAt: m.em,
    readAt: m.lida ? m.em : undefined,
    metadata: {},
    isInternalNote: false,
  }));
}

export function emailToConversation(email: EmailMsg, tenantId: string, channelId: string): Conversation {
  return {
    id: `conv_email_${email.id}`,
    tenantId,
    channelId,
    channelType: "email",
    subject: email.assunto,
    participants: [
      { id: email.de, name: email.de, role: "external", email: email.de },
      { id: email.para, name: email.para, role: "external", email: email.para },
    ],
    unreadCount: email.pasta === "Caixa de Entrada" && !email.lida ? 1 : 0,
    lastMessageAt: email.em,
    status: "open",
    tags: [email.pasta],
    legacyEmailId: email.id,
  };
}

export function emailToMessage(email: EmailMsg, conversationId: string): Message {
  return {
    id: `msg_email_${email.id}`,
    conversationId,
    authorId: email.de,
    authorRole: "external",
    body: email.corpo,
    bodyHtml: email.corpo,
    sentAt: email.em,
    readAt: email.lida ? email.em : undefined,
    metadata: { assunto: email.assunto, para: email.para, pasta: email.pasta },
    isInternalNote: false,
  };
}

export function chamadoToTicket(chamado: Chamado, tenantId: string): Ticket {
  return {
    id: `ticket_legacy_${chamado.id}`,
    tenantId,
    clientId: chamado.clientId,
    title: chamado.titulo,
    description: chamado.descricao,
    status:
      chamado.status === "Aberto"
        ? "open"
        : chamado.status === "Em andamento"
          ? "in_progress"
          : chamado.status === "Resolvido"
            ? "resolved"
            : "closed",
    priority: "medium",
    createdAt: chamado.criadoEm,
    updatedAt: chamado.atualizadoEm,
    resolvedAt: chamado.status === "Resolvido" || chamado.status === "Fechado" ? chamado.atualizadoEm : undefined,
    legacyChamadoId: chamado.id,
  };
}

export function createMockChannelConversations(
  tenantId: string,
  providers: ProviderConfig[],
  channels: Channel[],
): { conversations: Conversation[]; messages: Message[] } {
  const conversations: Conversation[] = [];
  const messages: Message[] = [];
  const mockTypes = ["whatsapp", "slack", "crisp", "telegram", "discord", "teams"] as const;

  for (const type of mockTypes) {
    const provider = providers.find((p) => p.type === type);
    const channel = channels.find((c) => c.type === type);
    if (!provider || !channel) continue;

    const convId = `conv_mock_${type}_${tenantId}`;
    const now = new Date().toISOString();
    conversations.push({
      id: convId,
      tenantId,
      channelId: channel.id,
      channelType: type,
      subject: `Demo ${type}`,
      participants: [
        { id: "demo_client", name: "Cliente Demo", role: "client" },
        { id: "demo_agent", name: "Equipe VendaPro", role: "employee" },
      ],
      clientId: "client-demo-001",
      assignedEmployeeId: "user-operacional",
      unreadCount: type === "whatsapp" ? 2 : 0,
      lastMessageAt: now,
      status: "open",
      tags: ["demo"],
    });
    messages.push({
      id: `msg_mock_${type}_1`,
      conversationId: convId,
      authorId: "demo_client",
      authorRole: "client",
      body: `Olá! Mensagem demo via ${type}.`,
      sentAt: now,
      isInternalNote: false,
    });
  }

  return { conversations, messages };
}

export function migrateLegacyCommunications(input: {
  tenantId: string;
  conversas: Conversa[];
  emails: EmailMsg[];
  chamados: Chamado[];
  existing?: CommunicationsSnapshot;
}): CommunicationsSnapshot {
  const providers = input.existing?.providers?.length
    ? input.existing.providers
    : createDefaultProviders(input.tenantId);
  const channels = input.existing?.channels?.length
    ? input.existing.channels
    : createDefaultChannels(providers);

  const internalChannel = channels.find((c) => c.type === "internal")!;
  const emailChannel = channels.find((c) => c.type === "email")!;

  const existingConvIds = new Set(
    (input.existing?.conversations ?? []).map((c) => c.legacyConversaId ?? c.legacyEmailId ?? c.id),
  );

  const conversations: Conversation[] = [...(input.existing?.conversations ?? [])];
  const messages: Message[] = [...(input.existing?.messages ?? [])];
  let tickets: Ticket[] = [...(input.existing?.tickets ?? [])];

  for (const conversa of input.conversas) {
    if (existingConvIds.has(conversa.id)) continue;
    const conv = conversaToConversation(conversa, input.tenantId, internalChannel.id);
    conversations.push(conv);
    messages.push(...mensagensToMessages(conversa, conv.id));
    existingConvIds.add(conversa.id);
  }

  for (const email of input.emails) {
    if (existingConvIds.has(email.id)) continue;
    const conv = emailToConversation(email, input.tenantId, emailChannel.id);
    conversations.push(conv);
    messages.push(emailToMessage(email, conv.id));
    existingConvIds.add(email.id);
  }

  const existingChamadoIds = new Set(tickets.map((t) => t.legacyChamadoId).filter(Boolean));
  for (const chamado of input.chamados) {
    if (existingChamadoIds.has(chamado.id)) continue;
    tickets.push(chamadoToTicket(chamado, input.tenantId));
  }

  tickets = syncTicketsFromChamados(tickets, input.chamados);

  const includeMocks = shouldIncludeMockConversations(input.tenantId);
  const hasMock = conversations.some((c) => c.id.includes("_mock_"));
  if (includeMocks && !hasMock) {
    commsDevLog("injecting demo channel conversations", { tenantId: input.tenantId });
    const mock = createMockChannelConversations(input.tenantId, providers, channels);
    conversations.push(...mock.conversations);
    messages.push(...mock.messages);
  }

  return {
    migratedV1: true,
    providers,
    channels,
    conversations,
    messages,
    tickets,
    internalNotes: input.existing?.internalNotes ?? [],
    attachments: input.existing?.attachments ?? [],
  };
}

export function findLegacyConversaId(conversation: Conversation): string | undefined {
  return conversation.legacyConversaId;
}

export function findLegacyEmailId(conversation: Conversation): string | undefined {
  return conversation.legacyEmailId;
}

export function ensureCommunicationsSnapshot(
  tenantId: string,
  partial?: CommunicationsSnapshot,
): CommunicationsSnapshot {
  if (partial?.migratedV1) return partial;
  return {
    ...EMPTY_COMMUNICATIONS_SNAPSHOT,
    ...partial,
    providers: partial?.providers?.length ? partial.providers : createDefaultProviders(tenantId),
    channels: partial?.channels?.length ? partial.channels : createDefaultChannels(createDefaultProviders(tenantId)),
  };
}

import type { CommunicationsSnapshot, Conversation, Message, ProviderConfig, Ticket, InternalNote, Attachment } from "../../domain/entities";
import type { ConversationFilters } from "../../types/provider.types";
import type { ConversationRepository } from "../interfaces/conversation.repository";
import type { MessageRepository } from "../interfaces/message.repository";
import type { TicketRepository } from "../interfaces/ticket.repository";
import type { ProviderRepository } from "../interfaces/provider.repository";
import type { AttachmentRepository } from "../interfaces/attachment.repository";

export type CommunicationsStateUpdater = (
  updater: (snapshot: CommunicationsSnapshot) => CommunicationsSnapshot,
) => void;

export type CommunicationsStateGetter = () => CommunicationsSnapshot;

function matchesFilters(c: Conversation, filters?: ConversationFilters): boolean {
  if (!filters) return true;
  if (filters.channelType && c.channelType !== filters.channelType) return false;
  if (filters.status && c.status !== filters.status) return false;
  if (filters.assignedEmployeeId && c.assignedEmployeeId !== filters.assignedEmployeeId) return false;
  if (filters.clientId && c.clientId !== filters.clientId) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay = [c.subject, ...c.participants.map((p) => p.name)].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function createLocalCommunicationsRepositories(
  getSnapshot: CommunicationsStateGetter,
  setSnapshot: CommunicationsStateUpdater,
) {
  const conversationRepo: ConversationRepository = {
    getSnapshot,
    list(filters) {
      return getSnapshot().conversations.filter((c) => matchesFilters(c, filters));
    },
    getById(id) {
      return getSnapshot().conversations.find((c) => c.id === id);
    },
    save(conversation) {
      setSnapshot((s) => ({
        ...s,
        conversations: [conversation, ...s.conversations.filter((c) => c.id !== conversation.id)],
      }));
    },
    update(id, patch) {
      setSnapshot((s) => ({
        ...s,
        conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },
    delete(id) {
      setSnapshot((s) => ({
        ...s,
        conversations: s.conversations.filter((c) => c.id !== id),
        messages: s.messages.filter((m) => m.conversationId !== id),
      }));
    },
  };

  const messageRepo: MessageRepository = {
    listByConversation(conversationId) {
      return getSnapshot()
        .messages.filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    },
    getById(id) {
      return getSnapshot().messages.find((m) => m.id === id);
    },
    save(message) {
      setSnapshot((s) => ({
        ...s,
        messages: [...s.messages, message],
        conversations: s.conversations.map((c) =>
          c.id === message.conversationId
            ? {
                ...c,
                lastMessageAt: message.sentAt,
                unreadCount:
                  message.authorRole === "client" && !message.readAt
                    ? c.unreadCount + 1
                    : c.unreadCount,
              }
            : c,
        ),
      }));
    },
    markRead(conversationId, messageIds) {
      setSnapshot((s) => ({
        ...s,
        messages: s.messages.map((m) => {
          if (m.conversationId !== conversationId) return m;
          if (messageIds && !messageIds.includes(m.id)) return m;
          if (m.authorRole !== "client") return m;
          return { ...m, readAt: m.readAt ?? new Date().toISOString() };
        }),
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      }));
    },
  };

  const ticketRepo: TicketRepository = {
    list() {
      return getSnapshot().tickets;
    },
    getById(id) {
      return getSnapshot().tickets.find((t) => t.id === id);
    },
    save(ticket) {
      setSnapshot((s) => ({
        ...s,
        tickets: [ticket, ...s.tickets.filter((t) => t.id !== ticket.id)],
      }));
    },
    updateStatus(id, status) {
      setSnapshot((s) => ({
        ...s,
        tickets: s.tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                status,
                updatedAt: new Date().toISOString(),
                resolvedAt:
                  status === "resolved" || status === "closed"
                    ? new Date().toISOString()
                    : t.resolvedAt,
              }
            : t,
        ),
      }));
    },
  };

  const providerRepo: ProviderRepository = {
    list() {
      return getSnapshot().providers;
    },
    getById(id) {
      return getSnapshot().providers.find((p) => p.id === id);
    },
    getByType(type) {
      return getSnapshot().providers.find((p) => p.type === type);
    },
    save(provider) {
      setSnapshot((s) => ({
        ...s,
        providers: [provider, ...s.providers.filter((p) => p.id !== provider.id)],
      }));
    },
    update(id, patch) {
      setSnapshot((s) => ({
        ...s,
        providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
  };

  const attachmentRepo: AttachmentRepository = {
    listByMessage(messageId) {
      return getSnapshot().attachments.filter((a) => a.messageId === messageId);
    },
    save(attachment) {
      setSnapshot((s) => ({
        ...s,
        attachments: [...s.attachments, attachment],
      }));
    },
  };

  return {
    conversationRepo,
    messageRepo,
    ticketRepo,
    providerRepo,
    attachmentRepo,
    addInternalNote(note: InternalNote) {
      setSnapshot((s) => ({
        ...s,
        internalNotes: [...s.internalNotes, note],
      }));
    },
    listInternalNotes(conversationId: string) {
      return getSnapshot().internalNotes.filter((n) => n.conversationId === conversationId);
    },
    replaceSnapshot(snapshot: CommunicationsSnapshot) {
      setSnapshot(() => snapshot);
    },
  };
}

export type LocalCommunicationsRepositories = ReturnType<typeof createLocalCommunicationsRepositories>;

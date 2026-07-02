import type {
  CommunicationsSnapshot,
  Conversation,
  Message,
  Ticket,
  TicketStatus,
  CommunicationChannelType,
} from "./entities";

export interface CommunicationsMetrics {
  todayConversations: number;
  avgResponseTimeMs: number;
  openTickets: number;
  resolvedTickets: number;
  messagesByChannel: Record<CommunicationChannelType, number>;
  messagesByUser: Record<string, number>;
  firstResponseTimeMs: number;
  resolutionRate: number;
  slaComplianceRate: number;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function computeMetrics(
  snapshot: CommunicationsSnapshot,
  conversations: Conversation[],
  slaThresholdMs = 4 * 60 * 60 * 1000,
): CommunicationsMetrics {
  const messagesByChannel = {} as Record<CommunicationChannelType, number>;
  const messagesByUser: Record<string, number> = {};
  const responseTimes: number[] = [];
  const firstResponseTimes: number[] = [];
  let slaMet = 0;
  let slaTotal = 0;

  for (const conv of conversations) {
    const msgs = snapshot.messages
      .filter((m) => m.conversationId === conv.id && !m.isInternalNote)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

    messagesByChannel[conv.channelType] = (messagesByChannel[conv.channelType] ?? 0) + msgs.length;

    for (const m of msgs) {
      messagesByUser[m.authorId] = (messagesByUser[m.authorId] ?? 0) + 1;
    }

    const firstClient = msgs.find((m) => m.authorRole === "client");
    const firstAgent = msgs.find((m) => m.authorRole === "employee" || m.authorRole === "admin");
    if (firstClient && firstAgent) {
      const delta =
        new Date(firstAgent.sentAt).getTime() - new Date(firstClient.sentAt).getTime();
      firstResponseTimes.push(delta);
    }

    for (let i = 1; i < msgs.length; i++) {
      const prev = msgs[i - 1];
      const curr = msgs[i];
      if (prev.authorRole === "client" && (curr.authorRole === "employee" || curr.authorRole === "admin")) {
        responseTimes.push(new Date(curr.sentAt).getTime() - new Date(prev.sentAt).getTime());
      }
    }
  }

  const tickets = snapshot.tickets;
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  for (const ticket of tickets) {
    if (ticket.status === "resolved" || ticket.status === "closed") {
      slaTotal++;
      const resolved = new Date(ticket.resolvedAt ?? ticket.updatedAt).getTime();
      const created = new Date(ticket.createdAt).getTime();
      if (resolved - created <= slaThresholdMs) slaMet++;
    }
  }

  const todayConversations = conversations.filter((c) => isToday(c.lastMessageAt)).length;

  return {
    todayConversations,
    avgResponseTimeMs: avg(responseTimes),
    openTickets,
    resolvedTickets,
    messagesByChannel,
    messagesByUser,
    firstResponseTimeMs: avg(firstResponseTimes),
    resolutionRate: tickets.length ? resolvedTickets / tickets.length : 0,
    slaComplianceRate: slaTotal ? slaMet / slaTotal : 1,
  };
}

export function countUnread(conversations: Conversation[]): number {
  return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
}

export function mapChamadoStatus(status: import("@/lib/types").StatusChamado): TicketStatus {
  switch (status) {
    case "Aberto":
      return "open";
    case "Em andamento":
      return "in_progress";
    case "Resolvido":
      return "resolved";
    case "Fechado":
      return "closed";
  }
}

export function mapTicketStatusToChamado(status: TicketStatus): import("@/lib/types").StatusChamado {
  switch (status) {
    case "open":
      return "Aberto";
    case "in_progress":
      return "Em andamento";
    case "resolved":
      return "Resolvido";
    case "closed":
      return "Fechado";
  }
}

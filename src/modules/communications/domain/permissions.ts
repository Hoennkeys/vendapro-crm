import type { Session } from "@/lib/auth/types";
import type { Lead, Usuario } from "@/lib/types";
import type { Conversation, InternalNote, Message, Ticket } from "./entities";

export type CommunicationsAuthRole = "ADMIN" | "OPERATIONAL" | "CLIENT";

export function resolveAuthRole(session: Session | null): CommunicationsAuthRole | null {
  if (!session) return null;
  if (session.user.platformRole === "SUPER_ADMIN") return "ADMIN";
  if (session.user.clientRole === "CLIENT") return "CLIENT";
  const membership = session.user.tenantMemberships?.[0];
  if (membership?.role === "ADMIN") return "ADMIN";
  if (membership?.role === "OPERATIONAL") return "OPERATIONAL";
  return null;
}

export function canViewConversation(
  role: CommunicationsAuthRole,
  conversation: Conversation,
  ctx: { userId: string; clientId?: string; leads: Lead[] },
): boolean {
  if (role === "ADMIN") return true;
  if (role === "CLIENT") {
    return conversation.clientId === ctx.clientId;
  }
  if (conversation.assignedEmployeeId === ctx.userId) return true;
  if (conversation.leadId) {
    const lead = ctx.leads.find((l) => l.id === conversation.leadId);
    if (lead?.responsavelId === ctx.userId) return true;
  }
  if (conversation.channelType === "internal" && !conversation.clientId) {
    return true;
  }
  return false;
}

export function canViewTicket(
  role: CommunicationsAuthRole,
  ticket: Ticket,
  ctx: { userId: string; clientId?: string },
): boolean {
  if (role === "ADMIN") return true;
  if (role === "CLIENT") return ticket.clientId === ctx.clientId;
  return ticket.assignedEmployeeId === ctx.userId || !ticket.assignedEmployeeId;
}

export function canViewInternalNote(
  role: CommunicationsAuthRole,
  note: InternalNote,
): boolean {
  if (role === "CLIENT") return false;
  if (role === "ADMIN") return true;
  return note.visibleToRoles.includes("employee");
}

export function canConfigureIntegrations(role: CommunicationsAuthRole): boolean {
  return role === "ADMIN";
}

export function canViewReports(role: CommunicationsAuthRole): boolean {
  return role === "ADMIN" || role === "OPERATIONAL";
}

export function filterConversationsForRole(
  role: CommunicationsAuthRole,
  conversations: Conversation[],
  ctx: { userId: string; clientId?: string; leads: Lead[]; usuarios: Usuario[] },
): Conversation[] {
  return conversations.filter((c) => canViewConversation(role, c, ctx));
}

export function filterTicketsForRole(
  role: CommunicationsAuthRole,
  tickets: Ticket[],
  ctx: { userId: string; clientId?: string },
): Ticket[] {
  return tickets.filter((t) => canViewTicket(role, t, ctx));
}

export function filterMessagesForRole(
  role: CommunicationsAuthRole,
  messages: Message[],
): Message[] {
  if (role === "CLIENT") {
    return messages.filter((m) => !m.isInternalNote);
  }
  return messages;
}

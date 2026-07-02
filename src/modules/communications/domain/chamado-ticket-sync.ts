import type { Chamado } from "@/lib/types";
import type { CommunicationsSnapshot, Ticket, TicketStatus } from "./entities";
import { mapChamadoStatus, mapTicketStatusToChamado } from "./metrics";

function nowIso() {
  return new Date().toISOString();
}

export function syncTicketsFromChamados(tickets: Ticket[], chamados: Chamado[]): Ticket[] {
  const chamadoById = new Map(chamados.map((c) => [c.id, c]));

  return tickets.map((ticket) => {
    if (!ticket.legacyChamadoId) return ticket;
    const chamado = chamadoById.get(ticket.legacyChamadoId);
    if (!chamado) return ticket;

    const expectedStatus = mapChamadoStatus(chamado.status);
    if (ticket.status === expectedStatus && ticket.updatedAt === chamado.atualizadoEm) {
      return ticket;
    }

    return {
      ...ticket,
      status: expectedStatus,
      updatedAt: chamado.atualizadoEm,
      resolvedAt:
        expectedStatus === "resolved" || expectedStatus === "closed"
          ? (ticket.resolvedAt ?? chamado.atualizadoEm)
          : ticket.resolvedAt,
    };
  });
}

export function syncChamadosFromTicket(chamados: Chamado[], ticket: Ticket): Chamado[] {
  if (!ticket.legacyChamadoId) return chamados;

  const expectedStatus = mapTicketStatusToChamado(ticket.status);

  return chamados.map((chamado) => {
    if (chamado.id !== ticket.legacyChamadoId) return chamado;
    if (chamado.status === expectedStatus) return chamado;
    return {
      ...chamado,
      status: expectedStatus,
      atualizadoEm: ticket.updatedAt ?? nowIso(),
    };
  });
}

export function applyTicketStatusInSnapshot(
  snapshot: CommunicationsSnapshot,
  ticketId: string,
  status: TicketStatus,
): CommunicationsSnapshot {
  const updatedAt = nowIso();
  return {
    ...snapshot,
    tickets: snapshot.tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status,
            updatedAt,
            resolvedAt:
              status === "resolved" || status === "closed"
                ? (ticket.resolvedAt ?? updatedAt)
                : ticket.resolvedAt,
          }
        : ticket,
    ),
  };
}

export function applyChamadoStatusInSnapshot(
  snapshot: CommunicationsSnapshot,
  chamados: Chamado[],
): CommunicationsSnapshot {
  return {
    ...snapshot,
    tickets: syncTicketsFromChamados(snapshot.tickets, chamados),
  };
}

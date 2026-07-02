import type { Ticket, TicketStatus } from "../../domain/entities";

export interface TicketRepository {
  list(): Ticket[];
  getById(id: string): Ticket | undefined;
  save(ticket: Ticket): void;
  updateStatus(id: string, status: TicketStatus): void;
}

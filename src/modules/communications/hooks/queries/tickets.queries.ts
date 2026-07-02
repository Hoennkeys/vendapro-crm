import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrm } from "@/lib/crm-store";
import { mapTicketStatusToChamado } from "../../domain/metrics";
import { commsDevLog } from "../../lib/dev-diagnostics";
import { useCommunications } from "../../store/communications-context";

export function useTicketsQuery() {
  const { hub, tenantId, visibleTickets } = useCommunications();
  return useQuery({
    queryKey: ["communications", tenantId, "tickets"],
    queryFn: () => {
      const all = hub.listTickets();
      const ids = new Set(visibleTickets.map((t) => t.id));
      return all.filter((t) => ids.has(t.id));
    },
    refetchInterval: 10000,
  });
}

export function useUpdateTicketStatusMutation() {
  const { hub, tenantId } = useCommunications();
  const crm = useCrm();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: import("../../domain/entities").TicketStatus;
    }) => {
      hub.updateTicketStatus(ticketId, status);
      const ticket = hub.listTickets().find((t) => t.id === ticketId);
      if (!ticket?.legacyChamadoId) return;

      const chamado = crm.chamados.find((c) => c.id === ticket.legacyChamadoId);
      if (!chamado) return;

      const nextChamadoStatus = mapTicketStatusToChamado(status);
      if (chamado.status === nextChamadoStatus) return;

      crm.atualizarStatusChamado(chamado.id, nextChamadoStatus, { syncTicket: false });
      commsDevLog("ticket status synced to chamado", {
        ticketId,
        chamadoId: chamado.id,
        status: nextChamadoStatus,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["communications", tenantId, "tickets"] });
    },
  });
}

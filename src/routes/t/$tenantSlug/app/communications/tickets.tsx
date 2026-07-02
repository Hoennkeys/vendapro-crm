import { createFileRoute } from "@tanstack/react-router";
import { TicketListPage } from "@/modules/communications/components/tickets/ticket-list";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Comunicações" }] }),
  component: TicketListPage,
});

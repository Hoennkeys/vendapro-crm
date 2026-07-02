import { createFileRoute } from "@tanstack/react-router";
import { CommunicationsDashboard } from "@/modules/communications/components/reports/communications-dashboard";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/reports")({
  head: () => ({ meta: [{ title: "Relatórios — Comunicações" }] }),
  component: CommunicationsDashboard,
});

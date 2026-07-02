import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/modules/communications/components/integrations/integrations-page";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/integrations")({
  head: () => ({ meta: [{ title: "Integrações — Comunicações" }] }),
  component: IntegrationsPage,
});

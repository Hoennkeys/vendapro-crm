import { createFileRoute } from "@tanstack/react-router";
import { CommunicationsSettings } from "@/modules/communications/components/settings/communications-settings";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/settings")({
  head: () => ({ meta: [{ title: "Configurações — Comunicações" }] }),
  component: CommunicationsSettings,
});

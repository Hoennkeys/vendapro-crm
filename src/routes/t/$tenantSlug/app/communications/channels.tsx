import { createFileRoute } from "@tanstack/react-router";
import { ChannelStatusGrid } from "@/modules/communications/components/channels/channel-status-grid";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/channels")({
  head: () => ({ meta: [{ title: "Canais — Comunicações" }] }),
  component: ChannelStatusGrid,
});

import { createFileRoute } from "@tanstack/react-router";
import { CampaignsPage } from "@/modules/creator/components/campaigns-page";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator/campaigns")({
  head: () => ({ meta: [{ title: pageTitle("Campanhas") }] }),
  component: CampaignsPage,
});

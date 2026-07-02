import { createFileRoute } from "@tanstack/react-router";
import { CreatorDashboard } from "@/modules/creator/components/creator-dashboard";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator/")({
  head: () => ({ meta: [{ title: pageTitle("Overview") }] }),
  component: CreatorDashboard,
});

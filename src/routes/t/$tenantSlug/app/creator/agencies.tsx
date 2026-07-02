import { createFileRoute } from "@tanstack/react-router";
import { AgenciesPage } from "@/modules/creator/components/agencies-page";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator/agencies")({
  head: () => ({ meta: [{ title: pageTitle("Agencies") }] }),
  component: AgenciesPage,
});

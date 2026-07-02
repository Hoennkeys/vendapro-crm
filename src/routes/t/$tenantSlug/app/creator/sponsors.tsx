import { createFileRoute } from "@tanstack/react-router";
import { SponsorsPage } from "@/modules/creator/components/sponsors-page";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator/sponsors")({
  head: () => ({ meta: [{ title: pageTitle("Sponsors") }] }),
  component: SponsorsPage,
});

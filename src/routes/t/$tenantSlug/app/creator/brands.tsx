import { createFileRoute } from "@tanstack/react-router";
import { BrandsPage } from "@/modules/creator/components/brands-page";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator/brands")({
  head: () => ({ meta: [{ title: pageTitle("Marcas") }] }),
  component: BrandsPage,
});

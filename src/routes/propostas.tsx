import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/propostas")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/propostas",
      params: { tenantSlug: DEMO_TENANT_SLUG },
    });
  },
});

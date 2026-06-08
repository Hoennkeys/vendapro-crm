import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/configuracoes")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/configuracoes",
      params: { tenantSlug: DEMO_TENANT_SLUG },
    });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/painel")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/painel",
      params: { tenantSlug: DEMO_TENANT_SLUG },
    });
  },
});

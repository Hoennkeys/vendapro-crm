import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/funil")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/funil",
      params: { tenantSlug: DEMO_TENANT_SLUG },
    });
  },
});

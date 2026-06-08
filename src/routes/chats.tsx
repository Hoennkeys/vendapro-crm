import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/chats")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/chats",
      params: { tenantSlug: DEMO_TENANT_SLUG },
    });
  },
});

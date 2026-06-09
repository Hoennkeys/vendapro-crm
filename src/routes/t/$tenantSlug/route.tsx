import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getTenantBySlugServerFn } from "@/lib/api/tenants.functions";
import { isClientServerApiEnabled } from "@/lib/client/server-api";
import { isValidTenantSlug } from "@/lib/tenant/mock-tenants";
import { TenantProvider } from "@/lib/tenant/tenant-store";

export const Route = createFileRoute("/t/$tenantSlug")({
  beforeLoad: async ({ params }) => {
    if (isClientServerApiEnabled()) {
      const tenant = await getTenantBySlugServerFn({ data: { slug: params.tenantSlug } });
      if (!tenant) throw redirect({ to: "/login" });
      return;
    }

    if (typeof window === "undefined") return;
    if (!isValidTenantSlug(params.tenantSlug)) {
      throw redirect({ to: "/login" });
    }
  },
  component: TenantLayout,
});

function TenantLayout() {
  const { tenantSlug } = Route.useParams();

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <Outlet />
    </TenantProvider>
  );
}

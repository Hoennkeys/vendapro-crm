import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isValidTenantSlug } from "@/lib/tenant/mock-tenants";

export const Route = createFileRoute("/t/$tenantSlug")({
  beforeLoad: ({ params }) => {
    if (!isValidTenantSlug(params.tenantSlug)) {
      throw redirect({ to: "/login" });
    }
  },
  component: TenantLayout,
});

function TenantLayout() {
  return <Outlet />;
}

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isValidTenantSlug } from "@/lib/tenant/mock-tenants";
import { TenantProvider } from "@/lib/tenant/tenant-store";

export const Route = createFileRoute("/t/$tenantSlug")({
  beforeLoad: ({ params }) => {
    // SSR não tem localStorage — validação completa ocorre no cliente após hidratação.
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

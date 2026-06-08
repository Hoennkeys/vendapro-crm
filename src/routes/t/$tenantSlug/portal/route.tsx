import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalLayout } from "@/layouts/portal-layout";
import { requireClientPortalAccess } from "@/lib/auth/guards";

export const Route = createFileRoute("/t/$tenantSlug/portal")({
  beforeLoad: ({ context, params, location }) => {
    requireClientPortalAccess(context, params.tenantSlug, location.href);
  },
  component: PortalRouteLayout,
});

function PortalRouteLayout() {
  const { tenantSlug } = Route.useParams();
  return (
    <PortalLayout tenantSlug={tenantSlug}>
      <Outlet />
    </PortalLayout>
  );
}

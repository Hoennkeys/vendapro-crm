import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { requireTenantAppAccess } from "@/lib/auth/guards";
import { CrmProvider } from "@/lib/crm-store";

export const Route = createFileRoute("/t/$tenantSlug/app")({
  beforeLoad: ({ context, params, location }) => {
    requireTenantAppAccess(context, params.tenantSlug, location.href);
  },
  component: AppRouteLayout,
});

function AppRouteLayout() {
  return (
    <CrmProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </CrmProvider>
  );
}

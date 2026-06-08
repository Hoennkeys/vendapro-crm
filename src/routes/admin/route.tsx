import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/admin-layout";
import { requireSuperAdmin } from "@/lib/auth/guards";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    requireSuperAdmin(context);
  },
  component: AdminRouteLayout,
});

function AdminRouteLayout() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

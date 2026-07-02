import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CreatorProvider } from "@/modules/creator/store/creator-context";
import { CreatorSubNav } from "@/modules/creator/components/creator-sub-nav";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/creator")({
  head: () => ({ meta: [{ title: pageTitle("Dashboard") }] }),
  component: CreatorLayout,
});

function CreatorLayout() {
  return (
    <CreatorProvider>
      <div className="space-y-2">
        <CreatorSubNav />
        <Outlet />
      </div>
    </CreatorProvider>
  );
}

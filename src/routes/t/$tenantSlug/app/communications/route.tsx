import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CommunicationsProvider } from "@/modules/communications/store/communications-context";
import { CommunicationsSubNav } from "@/modules/communications/components/communications-sub-nav";
import { pageTitle } from "@/lib/product-branding";

export const Route = createFileRoute("/t/$tenantSlug/app/communications")({
  head: () => ({ meta: [{ title: pageTitle("Comunicações") }] }),
  component: CommunicationsLayout,
});

function CommunicationsLayout() {
  return (
    <CommunicationsProvider>
      <div className="flex h-[calc(100vh-7rem)] flex-col">
        <div className="mb-2 shrink-0">
          <h1 className="text-2xl font-semibold tracking-tight">Comunicações</h1>
          <p className="text-sm text-muted-foreground">
            Hub omnichannel — Inbox, tickets, canais e integrações.
          </p>
        </div>
        <CommunicationsSubNav />
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </CommunicationsProvider>
  );
}

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth/auth-store";
import { userInitials } from "@/lib/auth/session";
import { getMockTenant } from "@/lib/tenant/mock-tenants";

type PortalLayoutProps = {
  children: ReactNode;
  tenantSlug: string;
};

export function PortalLayout({ children, tenantSlug }: PortalLayoutProps) {
  const { session, logout } = useAuth();
  const tenant = getMockTenant(tenantSlug);
  const initials = session ? userInitials(session.user.nome) : "CL";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <div className="leading-tight">
          <p className="text-sm font-semibold">{tenant?.nome ?? tenantSlug}</p>
          <p className="text-xs text-muted-foreground">Portal do Cliente</p>
        </div>
        <div className="flex-1" />
        <ThemeToggle />
        <span className="hidden text-sm text-muted-foreground sm:inline">{session?.user.nome}</span>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {initials}
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 md:p-6">{children}</main>
    </div>
  );
}

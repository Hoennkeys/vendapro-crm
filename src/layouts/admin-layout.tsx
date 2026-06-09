import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth/auth-store";
import { userInitials } from "@/lib/auth/session";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const initials = session ? userInitials(session.user.nome) : "AD";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">VendaPro Admin</p>
            <p className="text-xs text-muted-foreground">Plataforma</p>
          </div>
        </div>
        <nav className="ml-6 flex items-center gap-4 text-sm">
          <Link
            to="/admin"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "font-medium text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/tenants"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "font-medium text-foreground" }}
          >
            Tenants
          </Link>
          <Link
            to="/admin/billing"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "font-medium text-foreground" }}
          >
            Billing
          </Link>
        </nav>
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
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

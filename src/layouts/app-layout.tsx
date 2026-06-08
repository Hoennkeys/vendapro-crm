import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-store";
import { userInitials } from "@/lib/auth/session";

export function AppLayout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const initials = session ? userInitials(session.user.nome) : "AD";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex-1" />
          <ThemeToggle />
          <span className="hidden text-sm text-muted-foreground md:inline">
            {session?.user.nome}
          </span>
          <Button variant="ghost" size="icon" onClick={() => void logout()} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

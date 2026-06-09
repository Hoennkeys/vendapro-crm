import { Link, useParams } from "@tanstack/react-router";
import { FileText, FolderKanban, Headphones, Home, Receipt } from "lucide-react";

const navItems = [
  { label: "Início", to: "/t/$tenantSlug/portal/" as const, icon: Home, exact: true },
  { label: "Propostas", to: "/t/$tenantSlug/portal/propostas" as const, icon: FileText },
  { label: "Projetos", to: "/t/$tenantSlug/portal/projetos" as const, icon: FolderKanban },
  { label: "Chamados", to: "/t/$tenantSlug/portal/chamados" as const, icon: Headphones },
  { label: "Faturamento", to: "/t/$tenantSlug/portal/faturamento" as const, icon: Receipt },
] as const;

export function PortalNav() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/portal" });

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b pb-3">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          params={{ tenantSlug }}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "bg-primary/10 font-medium text-primary hover:text-primary" }}
          activeOptions={{ exact: item.exact ?? false }}
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

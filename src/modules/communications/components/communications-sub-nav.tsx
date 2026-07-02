import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  Inbox,
  Ticket,
  Radio,
  Plug,
  BarChart3,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { segment: "inbox", label: "Inbox", icon: Inbox },
  { segment: "tickets", label: "Tickets", icon: Ticket },
  { segment: "channels", label: "Canais", icon: Radio },
  { segment: "integrations", label: "Integrações", icon: Plug },
  { segment: "reports", label: "Relatórios", icon: BarChart3 },
  { segment: "settings", label: "Configurações", icon: Settings2 },
] as const;

export function CommunicationsSubNav() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/app/communications" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-3 mb-4">
      {NAV.map((item) => {
        const href = `/t/${tenantSlug}/app/communications/${item.segment}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.segment}
            to={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

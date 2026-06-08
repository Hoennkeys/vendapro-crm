import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KanbanSquare,
  MessageSquare,
  Mail,
  CalendarDays,
  FileText,
  Settings,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Painel", to: "/t/$tenantSlug/app/painel" as const, icon: LayoutDashboard },
  { title: "Funil de Vendas", to: "/t/$tenantSlug/app/funil" as const, icon: KanbanSquare },
  { title: "Chats", to: "/t/$tenantSlug/app/chats" as const, icon: MessageSquare },
  { title: "E-mails", to: "/t/$tenantSlug/app/emails" as const, icon: Mail },
  { title: "Agenda", to: "/t/$tenantSlug/app/agenda" as const, icon: CalendarDays },
  { title: "Propostas", to: "/t/$tenantSlug/app/propostas" as const, icon: FileText },
];

export function AppSidebar() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/app" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">VendaPro</span>
            <span className="text-xs text-muted-foreground">CRM de Vendas</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/t/${tenantSlug}/app/${item.to.split("/").pop()}`}
                    tooltip={item.title}
                  >
                    <Link to={item.to} params={{ tenantSlug }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/t/${tenantSlug}/app/configuracoes`}
              tooltip="Configurações"
            >
              <Link to="/t/$tenantSlug/app/configuracoes" params={{ tenantSlug }}>
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

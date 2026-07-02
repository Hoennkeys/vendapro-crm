import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { Settings, Sparkles } from "lucide-react";
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
import { AppSidebarNavMenu } from "@/components/app-sidebar-nav-menu";
import { AppSidebarCreatorGroup } from "@/components/app-sidebar-creator-group";
import { AppSidebarPosVendaGroup } from "@/components/app-sidebar-posvenda-group";
import { AppSidebarComunicacoesGroup } from "@/components/app-sidebar-comunicacoes-group";
import { COMMERCIAL_SECTION_LABEL, commercialNav } from "@/lib/navigation/app-nav";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/product-branding";
import { useTenant } from "@/lib/tenant/tenant-store";

export function AppSidebar() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/app" });
  const { whiteLabel } = useTenant();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">{whiteLabel.nome}</span>
            <span className="text-xs text-muted-foreground">{PRODUCT_NAME}</span>
            <span className="text-[10px] text-muted-foreground/80">{PRODUCT_TAGLINE}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarCreatorGroup tenantSlug={tenantSlug} pathname={pathname} />
        <SidebarGroup>
          <SidebarGroupLabel>{COMMERCIAL_SECTION_LABEL}</SidebarGroupLabel>
          <SidebarGroupContent>
            <AppSidebarNavMenu
              items={commercialNav}
              tenantSlug={tenantSlug}
              pathname={pathname}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <AppSidebarComunicacoesGroup tenantSlug={tenantSlug} pathname={pathname} />
        <AppSidebarPosVendaGroup tenantSlug={tenantSlug} pathname={pathname} />
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

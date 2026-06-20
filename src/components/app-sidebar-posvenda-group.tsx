import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppSidebarNavMenu } from "@/components/app-sidebar-nav-menu";
import {
  POS_VENDA_SECTION_LABEL,
  isPosVendaRouteActive,
  posVendaNav,
} from "@/lib/navigation/app-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-posvenda-open";

type AppSidebarPosVendaGroupProps = {
  tenantSlug: string;
  pathname: string;
};

export function AppSidebarPosVendaGroup({ tenantSlug, pathname }: AppSidebarPosVendaGroupProps) {
  const routeActive = isPosVendaRouteActive(pathname, tenantSlug);

  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return routeActive;
    if (routeActive) return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  React.useEffect(() => {
    if (routeActive) setOpen(true);
  }, [routeActive]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="group/collapsible group-data-[collapsible=icon]:hidden"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger
            className={cn(
              "flex w-full cursor-pointer items-center justify-between hover:text-sidebar-foreground",
              routeActive && "text-sidebar-foreground",
            )}
          >
            <span>{POS_VENDA_SECTION_LABEL}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <AppSidebarNavMenu items={posVendaNav} tenantSlug={tenantSlug} pathname={pathname} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

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
  COMMUNICATIONS_SECTION_LABEL,
  communicationsNav,
  isCommunicationsNavActive,
} from "@/lib/navigation/app-nav";
import { useCommunicationsUnread } from "@/hooks/use-communications-unread";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-comunicacoes-open";

type Props = {
  tenantSlug: string;
  pathname: string;
};

export function AppSidebarComunicacoesGroup({ tenantSlug, pathname }: Props) {
  const routeActive = isCommunicationsNavActive(pathname, tenantSlug);
  const unread = useCommunicationsUnread();

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
            <span className="flex items-center gap-2">
              {COMMUNICATIONS_SECTION_LABEL}
              {unread > 0 && (
                <span className="rounded-full bg-emerald-600 px-1.5 text-[10px] text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </span>
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
            <AppSidebarNavMenu items={communicationsNav} tenantSlug={tenantSlug} pathname={pathname} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

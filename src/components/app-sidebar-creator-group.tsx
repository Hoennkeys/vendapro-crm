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
  CREATOR_SECTION_LABEL,
  creatorNav,
  isCreatorNavActive,
} from "@/lib/navigation/app-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-creator-open";

type Props = {
  tenantSlug: string;
  pathname: string;
};

export function AppSidebarCreatorGroup({ tenantSlug, pathname }: Props) {
  const routeActive = isCreatorNavActive(pathname, tenantSlug);

  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return true;
    if (routeActive) return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
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
            <span>{CREATOR_SECTION_LABEL}</span>
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
            <AppSidebarNavMenu items={creatorNav} tenantSlug={tenantSlug} pathname={pathname} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

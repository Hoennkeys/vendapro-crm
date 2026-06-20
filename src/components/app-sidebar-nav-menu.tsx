import { Link } from "@tanstack/react-router";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { isNavItemActive, isPipelineNavItem, type AppNavItem } from "@/lib/navigation/app-nav";

type AppSidebarNavMenuProps = {
  items: AppNavItem[];
  tenantSlug: string;
  pathname: string;
};

export function AppSidebarNavMenu({ items, tenantSlug, pathname }: AppSidebarNavMenuProps) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, tenantSlug, item);
        const isFunil = isPipelineNavItem(item);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link
                to={item.to}
                params={isFunil ? { tenantSlug, pipelineId: item.pipelineId } : { tenantSlug }}
              >
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

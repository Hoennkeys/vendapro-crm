import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { resolveAppBreadcrumbs } from "@/modules/creator/domain/terminology";
import { cn } from "@/lib/utils";

export function AppBreadcrumbs({ className }: { className?: string }) {
  const { tenantSlug } = useParams({ strict: false });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!tenantSlug) return null;

  const crumbs = resolveAppBreadcrumbs(pathname, tenantSlug);
  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1 text-sm text-muted-foreground", className)}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
            {crumb.href && !isLast ? (
              <Link to={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : undefined}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

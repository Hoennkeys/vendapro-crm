import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { segment: "", label: "Overview" },
  { segment: "brands", label: "Marcas" },
  { segment: "agencies", label: "Agencies" },
  { segment: "sponsors", label: "Sponsors" },
  { segment: "campaigns", label: "Campanhas" },
] as const;

export function CreatorSubNav() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/app/creator" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = `/t/${tenantSlug}/app/creator`;

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-3 mb-4">
      {NAV.map((item) => {
        const href = item.segment ? `${base}/${item.segment}` : base;
        const active =
          item.segment === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={item.segment || "overview"}
            to={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

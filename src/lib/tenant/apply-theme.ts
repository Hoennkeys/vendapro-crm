import type { TenantThemeColors } from "./types";

const THEME_CSS_VARS = [
  "--primary",
  "--primary-foreground",
  "--accent",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
] as const;

export function applyTheme(cores: TenantThemeColors): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--primary", cores.primary);
  root.style.setProperty("--primary-foreground", cores.primaryForeground);
  root.style.setProperty("--sidebar-primary", cores.primary);
  root.style.setProperty("--sidebar-primary-foreground", cores.primaryForeground);

  if (cores.accent) {
    root.style.setProperty("--accent", cores.accent);
  }
}

export function clearTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  for (const variable of THEME_CSS_VARS) {
    root.style.removeProperty(variable);
  }
}

export function applyFavicon(faviconUrl?: string): void {
  if (typeof document === "undefined" || !faviconUrl) return;

  let link = document.querySelector<HTMLLinkElement>("link[data-tenant-favicon]");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.setAttribute("data-tenant-favicon", "true");
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

export function clearFavicon(): void {
  if (typeof document === "undefined") return;
  document.querySelector("link[data-tenant-favicon]")?.remove();
}

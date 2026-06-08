import type { TenantWhiteLabel } from "./types";

export const DEFAULT_THEME_COLORS = {
  vendapro: {
    primary: "oklch(0.52 0.22 265)",
    primaryForeground: "oklch(0.99 0 0)",
    accent: "oklch(0.95 0.03 265)",
  },
  acme: {
    primary: "oklch(0.58 0.19 145)",
    primaryForeground: "oklch(0.99 0 0)",
    accent: "oklch(0.93 0.04 145)",
  },
} as const;

export const DEFAULT_WHITE_LABELS: Record<string, TenantWhiteLabel> = {
  demo: {
    tenantId: "tenant-demo",
    slug: "demo",
    nome: "Demo Corp",
    cores: { ...DEFAULT_THEME_COLORS.vendapro },
  },
  acme: {
    tenantId: "tenant-acme",
    slug: "acme",
    nome: "Acme Indústria",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Acme&backgroundColor=059669",
    cores: { ...DEFAULT_THEME_COLORS.acme },
  },
};

export function getDefaultWhiteLabel(slug: string): TenantWhiteLabel | null {
  const defaults = DEFAULT_WHITE_LABELS[slug];
  if (!defaults) return null;
  return structuredClone(defaults);
}

export const THEME_COLOR_PRESETS = [
  {
    id: "azul",
    label: "Azul VendaPro",
    cores: DEFAULT_THEME_COLORS.vendapro,
  },
  {
    id: "verde",
    label: "Verde",
    cores: DEFAULT_THEME_COLORS.acme,
  },
  {
    id: "laranja",
    label: "Laranja",
    cores: {
      primary: "oklch(0.65 0.2 45)",
      primaryForeground: "oklch(0.99 0 0)",
      accent: "oklch(0.94 0.04 45)",
    },
  },
] as const;

export type TenantThemeColors = {
  primary: string;
  primaryForeground: string;
  accent?: string;
};

export type TenantWhiteLabel = {
  tenantId: string;
  slug: string;
  nome: string;
  logoUrl?: string;
  faviconUrl?: string;
  cores: TenantThemeColors;
  dominioCustom?: string;
};

export type TenantConfig = TenantWhiteLabel;

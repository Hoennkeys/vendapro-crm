import type { TenantWhiteLabel } from "@/lib/tenant/types";

export type TenantStatus = "active" | "suspended" | "trial";
export type TenantPlan = "starter" | "pro" | "enterprise";

export type PlatformTenant = {
  id: string;
  slug: string;
  nome: string;
  status: TenantStatus;
  plan: TenantPlan;
  createdAt: string;
  whiteLabel: TenantWhiteLabel;
  /** Tenants seeded no bootstrap não podem ser excluídos. */
  isSystem?: boolean;
};

export type CreateTenantInput = {
  nome: string;
  slug: string;
  plan?: TenantPlan;
  status?: TenantStatus;
};

export type UpdateTenantInput = Partial<
  Pick<PlatformTenant, "nome" | "slug" | "status" | "plan" | "whiteLabel">
>;

export type PlatformMetrics = {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  mrrEstimate: number;
};

import { ACME_TENANT_SLUG, DEMO_TENANT_SLUG } from "./constants";
import { DEFAULT_WHITE_LABELS } from "./defaults";
import type { TenantWhiteLabel } from "./types";

export type MockTenant = {
  id: string;
  slug: string;
  nome: string;
};

export const MOCK_TENANTS: Record<string, MockTenant> = {
  [DEMO_TENANT_SLUG]: {
    id: DEFAULT_WHITE_LABELS.demo.tenantId,
    slug: DEMO_TENANT_SLUG,
    nome: DEFAULT_WHITE_LABELS.demo.nome,
  },
  [ACME_TENANT_SLUG]: {
    id: DEFAULT_WHITE_LABELS.acme.tenantId,
    slug: ACME_TENANT_SLUG,
    nome: DEFAULT_WHITE_LABELS.acme.nome,
  },
};

export function isValidTenantSlug(slug: string): boolean {
  return slug in MOCK_TENANTS;
}

export function getMockTenant(slug: string): MockTenant | null {
  return MOCK_TENANTS[slug] ?? null;
}

export function getMockTenantWhiteLabel(slug: string): TenantWhiteLabel | null {
  return DEFAULT_WHITE_LABELS[slug] ?? null;
}

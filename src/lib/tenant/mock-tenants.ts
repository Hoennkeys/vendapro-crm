import { DEMO_TENANT_SLUG } from "./constants";

export type MockTenant = {
  id: string;
  slug: string;
  nome: string;
};

export const MOCK_TENANTS: Record<string, MockTenant> = {
  [DEMO_TENANT_SLUG]: {
    id: "tenant-demo",
    slug: DEMO_TENANT_SLUG,
    nome: "Demo Corp",
  },
};

export function isValidTenantSlug(slug: string): boolean {
  return slug in MOCK_TENANTS;
}

export function getMockTenant(slug: string): MockTenant | null {
  return MOCK_TENANTS[slug] ?? null;
}

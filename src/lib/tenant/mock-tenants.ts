import { getPlatformTenantBySlug, listPlatformTenants } from "@/lib/admin/tenant-registry";
import { DEFAULT_WHITE_LABELS } from "./defaults";
import type { TenantWhiteLabel } from "./types";

export type MockTenant = {
  id: string;
  slug: string;
  nome: string;
};

export function isValidTenantSlug(slug: string): boolean {
  return getPlatformTenantBySlug(slug) !== null;
}

export function getMockTenant(slug: string): MockTenant | null {
  const tenant = getPlatformTenantBySlug(slug);
  if (!tenant) return null;
  return { id: tenant.id, slug: tenant.slug, nome: tenant.nome };
}

export function getMockTenantWhiteLabel(slug: string): TenantWhiteLabel | null {
  const tenant = getPlatformTenantBySlug(slug);
  if (tenant) return structuredClone(tenant.whiteLabel);
  return DEFAULT_WHITE_LABELS[slug] ? structuredClone(DEFAULT_WHITE_LABELS[slug]) : null;
}

/** @deprecated Use getMockTenant() ou listPlatformTenants(). */
export function getMockTenantsRecord(): Record<string, MockTenant> {
  return Object.fromEntries(
    listPlatformTenants().map((t) => [t.slug, { id: t.id, slug: t.slug, nome: t.nome }]),
  );
}

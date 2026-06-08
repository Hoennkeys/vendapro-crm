import { getDefaultWhiteLabel } from "./defaults";
import type { TenantWhiteLabel } from "./types";

const STORAGE_PREFIX = "vendapro_tenant_";
const STORAGE_VERSION = "v1";

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}_${STORAGE_VERSION}`;
}

export function loadTenantWhiteLabel(slug: string): TenantWhiteLabel {
  const defaults = getDefaultWhiteLabel(slug);
  if (!defaults) {
    throw new Error(`Tenant desconhecido: ${slug}`);
  }

  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = localStorage.getItem(storageKey(slug));
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as TenantWhiteLabel;
    return {
      ...defaults,
      ...parsed,
      tenantId: defaults.tenantId,
      slug: defaults.slug,
      cores: { ...defaults.cores, ...parsed.cores },
    };
  } catch {
    return defaults;
  }
}

export function persistTenantWhiteLabel(slug: string, whiteLabel: TenantWhiteLabel): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(slug), JSON.stringify(whiteLabel));
}

export function clearTenantWhiteLabel(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(slug));
}

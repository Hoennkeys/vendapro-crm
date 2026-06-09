import { DEFAULT_THEME_COLORS, DEFAULT_WHITE_LABELS } from "@/lib/tenant/defaults";
import type { TenantWhiteLabel } from "@/lib/tenant/types";

import type {
  CreateTenantInput,
  PlatformMetrics,
  PlatformTenant,
  UpdateTenantInput,
} from "./types";

const STORAGE_KEY = "vendapro_platform_tenants_v1";

const SYSTEM_SLUGS = new Set(["demo", "acme"]);

const PLAN_MRR: Record<PlatformTenant["plan"], number> = {
  starter: 99,
  pro: 299,
  enterprise: 799,
};

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
}

function seedTenants(): PlatformTenant[] {
  return Object.values(DEFAULT_WHITE_LABELS).map((wl) => ({
    id: wl.tenantId,
    slug: wl.slug,
    nome: wl.nome,
    status: "active" as const,
    plan: wl.slug === "acme" ? ("pro" as const) : ("starter" as const),
    createdAt: "2025-01-01T00:00:00.000Z",
    whiteLabel: structuredClone(wl),
    isSystem: true,
  }));
}

function readRegistry(): PlatformTenant[] {
  if (typeof window === "undefined") {
    return seedTenants();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedTenants();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as PlatformTenant[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = seedTenants();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = seedTenants();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeRegistry(tenants: PlatformTenant[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
}

function clearWhiteLabelStorage(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`vendapro_tenant_${slug}_v1`);
}

function syncWhiteLabel(tenant: PlatformTenant): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`vendapro_tenant_${tenant.slug}_v1`, JSON.stringify(tenant.whiteLabel));
}

export function listPlatformTenants(): PlatformTenant[] {
  return readRegistry();
}

export function getPlatformTenantById(id: string): PlatformTenant | null {
  return readRegistry().find((t) => t.id === id) ?? null;
}

export function getPlatformTenantBySlug(slug: string): PlatformTenant | null {
  return readRegistry().find((t) => t.slug === slug) ?? null;
}

export function createPlatformTenant(input: CreateTenantInput): PlatformTenant {
  const slug = slugify(input.slug || input.nome);
  if (!isValidSlug(slug)) {
    throw new Error("Slug inválido. Use letras minúsculas, números e hífens (mín. 2 caracteres).");
  }

  const tenants = readRegistry();
  if (tenants.some((t) => t.slug === slug)) {
    throw new Error(`Já existe um tenant com o slug "${slug}".`);
  }

  const whiteLabel: TenantWhiteLabel = {
    tenantId: `tenant-${slug}`,
    slug,
    nome: input.nome.trim(),
    cores: { ...DEFAULT_THEME_COLORS.vendapro },
  };

  const tenant: PlatformTenant = {
    id: whiteLabel.tenantId,
    slug,
    nome: input.nome.trim(),
    status: input.status ?? "trial",
    plan: input.plan ?? "starter",
    createdAt: nowIso(),
    whiteLabel,
  };

  const next = [...tenants, tenant];
  writeRegistry(next);
  syncWhiteLabel(tenant);
  return tenant;
}

export function updatePlatformTenant(id: string, updates: UpdateTenantInput): PlatformTenant {
  const tenants = readRegistry();
  const index = tenants.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Tenant não encontrado.");
  }

  const current = tenants[index];
  const nextSlug = updates.slug ? slugify(updates.slug) : current.slug;

  if (updates.slug && !isValidSlug(nextSlug)) {
    throw new Error("Slug inválido. Use letras minúsculas, números e hífens (mín. 2 caracteres).");
  }

  if (nextSlug !== current.slug && tenants.some((t) => t.slug === nextSlug && t.id !== id)) {
    throw new Error(`Já existe um tenant com o slug "${nextSlug}".`);
  }

  const whiteLabel: TenantWhiteLabel = updates.whiteLabel
    ? {
        ...current.whiteLabel,
        ...updates.whiteLabel,
        tenantId: current.id,
        slug: nextSlug,
        cores: updates.whiteLabel.cores
          ? { ...current.whiteLabel.cores, ...updates.whiteLabel.cores }
          : current.whiteLabel.cores,
      }
    : {
        ...current.whiteLabel,
        slug: nextSlug,
        nome: updates.nome ?? current.nome,
      };

  const updated: PlatformTenant = {
    ...current,
    ...updates,
    slug: nextSlug,
    nome: updates.nome ?? current.nome,
    whiteLabel,
  };

  const next = [...tenants];
  next[index] = updated;
  writeRegistry(next);
  syncWhiteLabel(updated);
  return updated;
}

export function deletePlatformTenant(id: string): void {
  const tenants = readRegistry();
  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) {
    throw new Error("Tenant não encontrado.");
  }
  if (tenant.isSystem || SYSTEM_SLUGS.has(tenant.slug)) {
    throw new Error("Tenants do sistema não podem ser excluídos.");
  }

  writeRegistry(tenants.filter((t) => t.id !== id));
  clearWhiteLabelStorage(tenant.slug);
}

export function computePlatformMetrics(
  userCount: number,
  tenantList?: PlatformTenant[],
): PlatformMetrics {
  const tenants = tenantList ?? readRegistry();
  const activeTenants = tenants.filter((t) => t.status === "active");
  const trialTenants = tenants.filter((t) => t.status === "trial");
  const suspendedTenants = tenants.filter((t) => t.status === "suspended");

  const mrrEstimate = activeTenants.reduce((sum, t) => sum + PLAN_MRR[t.plan], 0);

  return {
    totalTenants: tenants.length,
    activeTenants: activeTenants.length,
    trialTenants: trialTenants.length,
    suspendedTenants: suspendedTenants.length,
    totalUsers: userCount,
    mrrEstimate,
  };
}

export { slugify, isValidSlug };

import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { readAuthenticatedSession } from "@/lib/auth/read-session.server";
import type { Session } from "@/lib/auth/types";
import type {
  CreateTenantInput,
  PlatformMetrics,
  PlatformTenant,
  UpdateTenantInput,
} from "@/lib/admin/types";
import type { TenantWhiteLabel } from "@/lib/tenant/types";
import { DEFAULT_THEME_COLORS } from "@/lib/tenant/defaults";
import { getDb } from "@/lib/db/client.server";
import { seedDatabaseIfEmpty } from "@/lib/db/seed.server";
import { tenantCrmState, tenants, users } from "@/lib/db/schema";
import { EMPTY_CRM_SNAPSHOT } from "@/lib/db/types";
import { isServerDbEnabled } from "@/lib/server/feature.server";

const PLAN_MRR: Record<PlatformTenant["plan"], number> = {
  starter: 99,
  pro: 299,
  enterprise: 799,
};

function requireSuperAdmin(session: Session | null) {
  if (!session || session.user.platformRole !== "SUPER_ADMIN") {
    throw new Error("Acesso restrito a super-admin.");
  }
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

function rowToPlatformTenant(row: typeof tenants.$inferSelect): PlatformTenant {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    status: row.status as PlatformTenant["status"],
    plan: row.plan as PlatformTenant["plan"],
    createdAt: row.createdAt,
    whiteLabel: JSON.parse(row.whiteLabelJson) as TenantWhiteLabel,
    isSystem: row.isSystem,
  };
}

export const listTenantsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

  await seedDatabaseIfEmpty();
  const session = await readAuthenticatedSession();
  requireSuperAdmin(session);

  const db = getDb();
  return db.select().from(tenants).all().map(rowToPlatformTenant);
});

export const getPlatformMetricsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

  await seedDatabaseIfEmpty();
  const session = await readAuthenticatedSession();
  requireSuperAdmin(session);

  const db = getDb();
  const allTenants = db.select().from(tenants).all();
  const userCount = db.select().from(users).all().length;

  const metrics: PlatformMetrics = {
    totalTenants: allTenants.length,
    activeTenants: allTenants.filter((t) => t.status === "active").length,
    trialTenants: allTenants.filter((t) => t.status === "trial").length,
    suspendedTenants: allTenants.filter((t) => t.status === "suspended").length,
    totalUsers: userCount,
    mrrEstimate: allTenants
      .filter((t) => t.status === "active")
      .reduce((acc, t) => acc + PLAN_MRR[t.plan as PlatformTenant["plan"]], 0),
  };

  return metrics;
});

export const createTenantServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      nome: z.string().min(2),
      slug: z.string().min(2),
      plan: z.enum(["starter", "pro", "enterprise"]).optional(),
      status: z.enum(["active", "suspended", "trial"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

    await seedDatabaseIfEmpty();
    const session = await readAuthenticatedSession();
    requireSuperAdmin(session);

    const slug = slugify(data.slug);
    if (!isValidSlug(slug)) throw new Error("Slug inválido.");

    const db = getDb();
    const exists = db.select().from(tenants).where(eq(tenants.slug, slug)).get();
    if (exists) throw new Error("Slug já em uso.");

    const id = `tenant-${slug}`;
    const createdAt = new Date().toISOString();
    const whiteLabel: TenantWhiteLabel = {
      tenantId: id,
      slug,
      nome: data.nome,
      cores: { ...DEFAULT_THEME_COLORS.vendapro },
    };

    db.insert(tenants)
      .values({
        id,
        slug,
        nome: data.nome,
        status: data.status ?? "active",
        plan: data.plan ?? "starter",
        whiteLabelJson: JSON.stringify(whiteLabel),
        isSystem: false,
        createdAt,
      })
      .run();

    db.insert(tenantCrmState)
      .values({
        tenantId: id,
        stateJson: JSON.stringify({ ...EMPTY_CRM_SNAPSHOT, usuarios: [] }),
        updatedAt: createdAt,
      })
      .run();

    const row = db.select().from(tenants).where(eq(tenants.id, id)).get();
    return rowToPlatformTenant(row!);
  });

export const updateTenantServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tenantId: z.string().min(1),
      updates: z.custom<UpdateTenantInput>(),
    }),
  )
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

    await seedDatabaseIfEmpty();
    const session = await readAuthenticatedSession();
    requireSuperAdmin(session);

    const db = getDb();
    const row = db.select().from(tenants).where(eq(tenants.id, data.tenantId)).get();
    if (!row) throw new Error("Tenant não encontrado.");

    const current = rowToPlatformTenant(row);
    const next: PlatformTenant = {
      ...current,
      ...data.updates,
      whiteLabel: data.updates.whiteLabel
        ? { ...current.whiteLabel, ...data.updates.whiteLabel }
        : current.whiteLabel,
    };

    db.update(tenants)
      .set({
        slug: next.slug,
        nome: next.nome,
        status: next.status,
        plan: next.plan,
        whiteLabelJson: JSON.stringify(next.whiteLabel),
      })
      .where(eq(tenants.id, data.tenantId))
      .run();

    const updated = db.select().from(tenants).where(eq(tenants.id, data.tenantId)).get();
    return rowToPlatformTenant(updated!);
  });

export const deleteTenantServerFn = createServerFn({ method: "POST" })
  .validator(z.object({ tenantId: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

    await seedDatabaseIfEmpty();
    const session = await readAuthenticatedSession();
    requireSuperAdmin(session);

    const db = getDb();
    const row = db.select().from(tenants).where(eq(tenants.id, data.tenantId)).get();
    if (!row) throw new Error("Tenant não encontrado.");
    if (row.isSystem) throw new Error("Tenants de sistema não podem ser excluídos.");

    db.delete(tenantCrmState).where(eq(tenantCrmState.tenantId, data.tenantId)).run();
    db.delete(tenants).where(eq(tenants.id, data.tenantId)).run();
    return { ok: true as const };
  });

export const getTenantBySlugServerFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");

    await seedDatabaseIfEmpty();
    const db = getDb();
    const row = db.select().from(tenants).where(eq(tenants.slug, data.slug)).get();
    return row ? rowToPlatformTenant(row) : null;
  });

export type { CreateTenantInput };

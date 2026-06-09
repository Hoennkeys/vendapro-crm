import { eq } from "drizzle-orm";

import { MOCK_USERS } from "@/lib/auth/mock-users";
import { hashPassword } from "@/lib/auth/password.server";
import { DEFAULT_WHITE_LABELS } from "@/lib/tenant/defaults";
import {
  chamadosMock,
  faturasMock,
  pipelineItemsMock,
  propostasMock,
  vendedoresMock,
} from "@/lib/mock-data";

import { getDb } from "./client.server";
import { ensureSchema } from "./migrate.server";
import { tenantCrmState, tenantMemberships, tenants, users } from "./schema";
import type { TenantCrmSnapshot } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function filterPipelineItemsForTenant(tenantId: string) {
  const clientIds = new Set(
    propostasMock.filter((p) => p.tenantId === tenantId).map((p) => p.clientId),
  );
  chamadosMock.filter((c) => c.tenantId === tenantId).forEach((c) => clientIds.add(c.clientId));
  return pipelineItemsMock.filter((item) => item.clientId && clientIds.has(item.clientId));
}

function buildTenantSnapshotFixed(tenantId: string): TenantCrmSnapshot {
  return {
    leads: [],
    tarefas: [],
    emails: [],
    conversas: [],
    propostas: propostasMock.filter((p) => p.tenantId === tenantId),
    chamados: chamadosMock.filter((c) => c.tenantId === tenantId),
    faturas: faturasMock.filter((f) => f.tenantId === tenantId),
    pipelineItems: filterPipelineItemsForTenant(tenantId),
    usuarios: vendedoresMock,
  };
}

export async function seedDatabaseIfEmpty() {
  ensureSchema();
  const db = getDb();

  const existing = db.select().from(tenants).all();
  if (existing.length > 0) return false;

  const createdAt = nowIso();

  for (const wl of Object.values(DEFAULT_WHITE_LABELS)) {
    db.insert(tenants)
      .values({
        id: wl.tenantId,
        slug: wl.slug,
        nome: wl.nome,
        status: "active",
        plan: wl.slug === "acme" ? "pro" : "starter",
        whiteLabelJson: JSON.stringify(wl),
        isSystem: true,
        createdAt,
      })
      .run();

    db.insert(tenantCrmState)
      .values({
        tenantId: wl.tenantId,
        stateJson: JSON.stringify(buildTenantSnapshotFixed(wl.tenantId)),
        updatedAt: createdAt,
      })
      .run();
  }

  for (const mock of MOCK_USERS) {
    const passwordHash = await hashPassword(mock.password);
    db.insert(users)
      .values({
        id: mock.id,
        email: mock.email.toLowerCase(),
        passwordHash,
        nome: mock.nome,
        platformRole: mock.platformRole ?? null,
        clientRole: mock.clientRole ?? null,
        clientId: mock.clientId ?? null,
        tenantId: mock.tenantId ?? null,
        tenantSlug: mock.tenantSlug ?? null,
      })
      .run();

    if (mock.tenantMemberships) {
      for (const membership of mock.tenantMemberships) {
        db.insert(tenantMemberships)
          .values({
            id: `${mock.id}-${membership.tenantId}`,
            userId: mock.id,
            tenantId: membership.tenantId,
            tenantSlug: membership.tenantSlug,
            role: membership.role,
          })
          .run();
      }
    }
  }

  return true;
}

export function getUserByEmail(email: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get();
}

export function getUserMemberships(userId: string) {
  const db = getDb();
  return db.select().from(tenantMemberships).where(eq(tenantMemberships.userId, userId)).all();
}

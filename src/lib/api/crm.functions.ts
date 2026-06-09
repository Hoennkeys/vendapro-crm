import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { readAuthenticatedSession } from "@/lib/auth/read-session.server";
import type { Session } from "@/lib/auth/types";
import type { Chamado } from "@/lib/types";
import { getDb } from "@/lib/db/client.server";
import { seedDatabaseIfEmpty } from "@/lib/db/seed.server";
import { tenantCrmState } from "@/lib/db/schema";
import { EMPTY_CRM_SNAPSHOT, type TenantCrmSnapshot } from "@/lib/db/types";
import { isServerDbEnabled } from "@/lib/server/feature.server";

async function requireSession() {
  const session = await readAuthenticatedSession();
  if (!session) throw new Error("Não autenticado.");
  return session;
}

function assertTenantAccess(session: Session, tenantId: string) {
  if (!session) throw new Error("Não autenticado.");
  if (session.user.platformRole === "SUPER_ADMIN") return;

  if (session.user.clientRole === "CLIENT") {
    if (session.user.tenantId !== tenantId) {
      throw new Error("Acesso negado ao tenant.");
    }
    return;
  }

  const allowed = session.user.tenantMemberships?.some((m) => m.tenantId === tenantId);
  if (!allowed) throw new Error("Acesso negado ao tenant.");
}

function readTenantSnapshot(tenantId: string): TenantCrmSnapshot {
  const db = getDb();
  const row = db.select().from(tenantCrmState).where(eq(tenantCrmState.tenantId, tenantId)).get();

  if (!row) return { ...EMPTY_CRM_SNAPSHOT, usuarios: [] };

  try {
    return { ...EMPTY_CRM_SNAPSHOT, ...JSON.parse(row.stateJson) } as TenantCrmSnapshot;
  } catch {
    return { ...EMPTY_CRM_SNAPSHOT, usuarios: [] };
  }
}

function writeTenantSnapshot(tenantId: string, snapshot: TenantCrmSnapshot) {
  const db = getDb();
  const updatedAt = new Date().toISOString();
  const payload = {
    tenantId,
    stateJson: JSON.stringify(snapshot),
    updatedAt,
  };

  const existing = db
    .select()
    .from(tenantCrmState)
    .where(eq(tenantCrmState.tenantId, tenantId))
    .get();

  if (existing) {
    db.update(tenantCrmState).set(payload).where(eq(tenantCrmState.tenantId, tenantId)).run();
  } else {
    db.insert(tenantCrmState).values(payload).run();
  }
}

export const getCrmStateServerFn = createServerFn({ method: "GET" })
  .validator(z.object({ tenantId: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) {
      throw new Error("API do servidor desabilitada.");
    }

    await seedDatabaseIfEmpty();
    const session = await requireSession();
    assertTenantAccess(session, data.tenantId);

    return readTenantSnapshot(data.tenantId);
  });

export const addChamadoServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tenantId: z.string().min(1),
      clientId: z.string().min(1),
      titulo: z.string().min(1),
      descricao: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) {
      throw new Error("API do servidor desabilitada.");
    }

    await seedDatabaseIfEmpty();
    const session = await requireSession();
    assertTenantAccess(session, data.tenantId);

    if (session.user.clientRole === "CLIENT" && session.user.clientId !== data.clientId) {
      throw new Error("Acesso negado.");
    }

    const snapshot = readTenantSnapshot(data.tenantId);
    const agora = new Date().toISOString();
    const novo: Chamado = {
      id: `ch_${Math.random().toString(36).slice(2, 9)}`,
      tenantId: data.tenantId,
      clientId: data.clientId,
      titulo: data.titulo,
      descricao: data.descricao,
      status: "Aberto",
      criadoEm: agora,
      atualizadoEm: agora,
    };

    snapshot.chamados = [novo, ...snapshot.chamados];
    writeTenantSnapshot(data.tenantId, snapshot);
    return novo;
  });

export const saveCrmStateServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tenantId: z.string().min(1),
      snapshot: z.custom<TenantCrmSnapshot>(),
    }),
  )
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) {
      throw new Error("API do servidor desabilitada.");
    }

    await seedDatabaseIfEmpty();
    const session = await requireSession();
    assertTenantAccess(session, data.tenantId);

    if (session.user.clientRole === "CLIENT") {
      throw new Error("Clientes não podem alterar o CRM completo.");
    }

    writeTenantSnapshot(data.tenantId, data.snapshot);
    return { ok: true as const };
  });

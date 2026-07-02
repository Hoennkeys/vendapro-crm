import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client.server";
import { tenantCrmState } from "@/lib/db/schema";
import { EMPTY_CRM_SNAPSHOT, type TenantCrmSnapshot } from "@/lib/db/types";

import type { CommunicationsSnapshot } from "../../domain/entities";
import { EMPTY_COMMUNICATIONS_SNAPSHOT } from "../../domain/entities";

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

/** Loads the communications slice from the normalized tenant CRM row (server-only). */
export async function loadCommunicationsFromDb(tenantId: string): Promise<CommunicationsSnapshot | null> {
  const snapshot = readTenantSnapshot(tenantId);
  return snapshot.communications ?? null;
}

/** Persists the communications slice into tenant_crm_state.state_json (server-only). */
export async function saveCommunicationsToDb(
  tenantId: string,
  communications: CommunicationsSnapshot,
): Promise<void> {
  const snapshot = readTenantSnapshot(tenantId);
  writeTenantSnapshot(tenantId, {
    ...snapshot,
    communications,
  });
}

/** Ensures a communications snapshot exists when hydrating from DB. */
export function mergeCommunicationsFromDb(
  tenantId: string,
  current?: CommunicationsSnapshot,
): CommunicationsSnapshot {
  if (current?.migratedV1) return current;
  return {
    ...EMPTY_COMMUNICATIONS_SNAPSHOT,
    ...current,
  };
}

export type DrizzleCommunicationsPersistence = {
  load: typeof loadCommunicationsFromDb;
  save: typeof saveCommunicationsToDb;
};

export function createDrizzleCommunicationsPersistence(): DrizzleCommunicationsPersistence {
  return {
    load: loadCommunicationsFromDb,
    save: saveCommunicationsToDb,
  };
}

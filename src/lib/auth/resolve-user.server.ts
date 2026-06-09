import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client.server";
import { users } from "@/lib/db/schema";
import { getUserByEmail, getUserMemberships } from "@/lib/db/seed.server";

import type { SessionUser, TenantMembership } from "./types";

type DbUser = typeof users.$inferSelect;

export function dbUserToSessionUser(row: DbUser, memberships: TenantMembership[]): SessionUser {
  const user: SessionUser = {
    id: row.id,
    nome: row.nome,
    email: row.email,
  };

  if (row.platformRole) {
    user.platformRole = row.platformRole as SessionUser["platformRole"];
  }

  if (row.clientRole) {
    user.clientRole = row.clientRole as SessionUser["clientRole"];
    user.clientId = row.clientId ?? undefined;
    user.tenantId = row.tenantId ?? undefined;
    user.tenantSlug = row.tenantSlug ?? undefined;
  }

  if (memberships.length > 0) {
    user.tenantMemberships = memberships;
  }

  return user;
}

function membershipsFromRows(userId: string): TenantMembership[] {
  return getUserMemberships(userId).map(
    (m): TenantMembership => ({
      tenantId: m.tenantId,
      tenantSlug: m.tenantSlug,
      role: m.role as TenantMembership["role"],
    }),
  );
}

export function loadSessionUserByEmail(email: string): SessionUser | null {
  const row = getUserByEmail(email);
  if (!row) return null;
  return dbUserToSessionUser(row, membershipsFromRows(row.id));
}

export function loadSessionUserById(userId: string): SessionUser | null {
  const row = getDb().select().from(users).where(eq(users.id, userId)).get();
  if (!row) return null;
  return dbUserToSessionUser(row, membershipsFromRows(row.id));
}

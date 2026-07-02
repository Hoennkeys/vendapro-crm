import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { readAuthenticatedSession } from "@/lib/auth/read-session.server";
import type { Session } from "@/lib/auth/types";
import { isServerDbEnabled } from "@/lib/server/feature.server";

import type { CommunicationsSnapshot } from "../domain/entities";
import {
  loadCommunicationsFromDb,
  saveCommunicationsToDb,
} from "../repositories/server/drizzle.repository";

async function requireSession() {
  const session = await readAuthenticatedSession();
  if (!session) throw new Error("Não autenticado.");
  return session;
}

function assertTenantAccess(session: Session, tenantId: string) {
  if (session.user.platformRole === "SUPER_ADMIN") return;

  if (session.user.clientRole === "CLIENT") {
    if (session.user.tenantId !== tenantId) throw new Error("Acesso negado ao tenant.");
    return;
  }

  const allowed = session.user.tenantMemberships?.some((m) => m.tenantId === tenantId);
  if (!allowed) throw new Error("Acesso negado ao tenant.");
}

export const getCommunicationsStateServerFn = createServerFn({ method: "GET" })
  .validator(z.object({ tenantId: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");
    const session = await requireSession();
    assertTenantAccess(session, data.tenantId);
    return loadCommunicationsFromDb(data.tenantId);
  });

export const saveCommunicationsStateServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tenantId: z.string().min(1),
      communications: z.custom<CommunicationsSnapshot>(),
    }),
  )
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) throw new Error("API do servidor desabilitada.");
    const session = await requireSession();
    assertTenantAccess(session, data.tenantId);
    await saveCommunicationsToDb(data.tenantId, data.communications);
    return { ok: true as const };
  });

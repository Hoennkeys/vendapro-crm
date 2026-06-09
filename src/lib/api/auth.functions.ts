import { createServerFn } from "@tanstack/react-start";
import { clearSession, updateSession } from "@tanstack/react-start/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password.server";
import { readAuthenticatedSession } from "@/lib/auth/read-session.server";
import { loadSessionUserByEmail } from "@/lib/auth/resolve-user.server";
import { getSessionConfig, type ServerSessionData } from "@/lib/auth/session-config.server";
import type { Session } from "@/lib/auth/types";
import { getUserByEmail, seedDatabaseIfEmpty } from "@/lib/db/seed.server";
import { isServerDbEnabled } from "@/lib/server/feature.server";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function toClientSession(data: ServerSessionData): Session {
  return {
    user: data.user,
    expiresAt: data.expiresAt,
  };
}

export const loginServerFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!isServerDbEnabled()) {
      throw new Error("API do servidor desabilitada.");
    }

    await seedDatabaseIfEmpty();

    const row = getUserByEmail(data.email);
    if (!row) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const valid = await verifyPassword(data.password, row.passwordHash);
    if (!valid) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const user = loadSessionUserByEmail(data.email);
    if (!user) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const sessionData: ServerSessionData = {
      user,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };

    await updateSession(getSessionConfig(), sessionData);

    return toClientSession(sessionData);
  });

export const logoutServerFn = createServerFn({ method: "POST" }).handler(async () => {
  await clearSession(getSessionConfig());
  return { ok: true as const };
});

export const getSessionServerFn = createServerFn({ method: "GET" }).handler(async () => {
  if (!isServerDbEnabled()) return null;
  return readAuthenticatedSession();
});

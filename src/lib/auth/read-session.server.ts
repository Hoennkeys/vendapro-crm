import { clearSession, getSession } from "@tanstack/react-start/server";

import { loadSessionUserById } from "./resolve-user.server";
import { getSessionConfig, type ServerSessionData } from "./session-config.server";
import type { Session } from "./types";

export async function readAuthenticatedSession(): Promise<Session | null> {
  const config = getSessionConfig();
  const stored = await getSession<ServerSessionData>(config);
  if (!stored.data?.user?.id || !stored.data.expiresAt) return null;
  if (new Date(stored.data.expiresAt).getTime() <= Date.now()) return null;

  const refreshed = loadSessionUserById(stored.data.user.id);
  if (!refreshed) {
    await clearSession(config);
    return null;
  }

  return {
    user: refreshed,
    expiresAt: stored.data.expiresAt,
  };
}

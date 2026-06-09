import { createIsomorphicFn } from "@tanstack/react-start";

import { getSessionServerFn } from "@/lib/api/auth.functions";
import { isClientServerApiEnabled } from "@/lib/client/server-api";

import { getSessionFromStorage, parseSessionFromCookie } from "./session";

export const loadSessionForRequest = createIsomorphicFn()
  .server(async () => {
    const { isServerDbEnabled } = await import("@/lib/server/feature.server");
    if (isServerDbEnabled()) {
      const { readAuthenticatedSession } = await import("@/lib/auth/read-session.server");
      return readAuthenticatedSession();
    }

    const { getRequest } = await import("@tanstack/react-start/server");
    return parseSessionFromCookie(getRequest().headers.get("cookie"));
  })
  .client(async () => {
    if (isClientServerApiEnabled()) {
      try {
        return await getSessionServerFn();
      } catch {
        return null;
      }
    }
    return getSessionFromStorage();
  });

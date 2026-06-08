import { createIsomorphicFn } from "@tanstack/react-start";

import { getSessionFromStorage, parseSessionFromCookie } from "./session";

export const loadSessionForRequest = createIsomorphicFn()
  .server(async () => {
    const { getRequest } = await import("@tanstack/react-start/server");
    return parseSessionFromCookie(getRequest().headers.get("cookie"));
  })
  .client(() => {
    return getSessionFromStorage();
  });

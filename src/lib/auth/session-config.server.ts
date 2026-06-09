import type { SessionUser } from "./types";

export const SESSION_COOKIE_NAME = "vendapro_session";

export type ServerSessionData = {
  user: SessionUser;
  expiresAt: string;
};

export function getSessionPassword(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-in-production-min-32-chars!!";
}

export function getSessionConfig() {
  return {
    password: getSessionPassword(),
    name: SESSION_COOKIE_NAME,
    maxAge: 60 * 60 * 24,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

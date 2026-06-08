import { findMockUser } from "./mock-users";
import type { Session, SessionUser } from "./types";

const SESSION_STORAGE_KEY = "vendapro_session_v1";
const SESSION_COOKIE = "vendapro_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function isSessionValid(session: Session): boolean {
  return new Date(session.expiresAt).getTime() > Date.now();
}

function parseSession(raw: string): Session | null {
  try {
    const session = JSON.parse(raw) as Session;
    return isSessionValid(session) ? session : null;
  } catch {
    return null;
  }
}

export function parseSessionFromCookie(cookieHeader: string | null): Session | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  if (!match) return null;
  return parseSession(decodeURIComponent(match[1]));
}

export function getSessionFromStorage(): Session | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return null;

  const session = parseSession(stored);
  if (!session) {
    clearSession();
    return null;
  }
  return session;
}

export function getDefaultPortalPath(session: Session): string {
  if (session.user.platformRole === "SUPER_ADMIN") return "/admin";
  if (session.user.clientRole === "CLIENT" && session.user.tenantSlug) {
    return `/t/${session.user.tenantSlug}/portal`;
  }
  const membership = session.user.tenantMemberships?.[0];
  if (membership) return `/t/${membership.tenantSlug}/app/painel`;
  return "/login";
}

export function createSession(user: SessionUser): Session {
  return {
    user,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
}

export function authenticate(email: string, password: string): Session | null {
  const user = findMockUser(email, password);
  return user ? createSession(user) : null;
}

export function persistSession(session: Session): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function userInitials(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

import { redirect } from "@tanstack/react-router";
import { getDefaultPortalPath } from "./session";
import type { Session, TenantRole } from "./types";
import { isValidTenantSlug } from "@/lib/tenant/mock-tenants";

type AuthContext = { session: Session | null };

const TENANT_APP_ROLES: TenantRole[] = ["ADMIN", "OPERATIONAL"];

export function requireAuth({ session }: AuthContext, returnTo?: string) {
  if (!session) {
    throw redirect({
      to: "/login",
      search: returnTo ? { redirect: returnTo } : undefined,
    });
  }
  return session;
}

export function requireSuperAdmin(context: AuthContext) {
  const session = requireAuth(context);
  if (session.user.platformRole !== "SUPER_ADMIN") {
    throw redirect({ to: getDefaultPortalPath(session) });
  }
  return session;
}

export function requireTenantAppAccess(
  context: AuthContext,
  tenantSlug: string,
  returnTo?: string,
) {
  const session = requireAuth(context, returnTo);

  if (typeof window !== "undefined" && !isValidTenantSlug(tenantSlug)) {
    throw redirect({ to: "/login" });
  }

  const membership = session.user.tenantMemberships?.find((m) => m.tenantSlug === tenantSlug);
  if (!membership || !TENANT_APP_ROLES.includes(membership.role)) {
    throw redirect({ to: getDefaultPortalPath(session) });
  }

  return session;
}

export function requireClientPortalAccess(
  context: AuthContext,
  tenantSlug: string,
  returnTo?: string,
) {
  const session = requireAuth(context, returnTo);

  if (typeof window !== "undefined" && !isValidTenantSlug(tenantSlug)) {
    throw redirect({ to: "/login" });
  }

  if (session.user.clientRole !== "CLIENT" || session.user.tenantSlug !== tenantSlug) {
    throw redirect({ to: getDefaultPortalPath(session) });
  }

  return session;
}

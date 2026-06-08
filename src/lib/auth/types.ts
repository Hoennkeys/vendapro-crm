export type PlatformRole = "SUPER_ADMIN";
export type TenantRole = "ADMIN" | "OPERATIONAL";
export type ClientRole = "CLIENT";

export type PortalRole = PlatformRole | TenantRole | ClientRole;

export type TenantMembership = {
  tenantId: string;
  tenantSlug: string;
  role: TenantRole;
};

export type SessionUser = {
  id: string;
  nome: string;
  email: string;
  platformRole?: PlatformRole;
  tenantMemberships?: TenantMembership[];
  clientRole?: ClientRole;
  clientId?: string;
  tenantSlug?: string;
  tenantId?: string;
};

export type Session = {
  user: SessionUser;
  expiresAt: string;
};

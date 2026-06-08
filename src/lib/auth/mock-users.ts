import type { SessionUser } from "./types";

type MockUserRecord = SessionUser & { password: string };

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: "user-super-admin",
    email: "admin@vendapro.app",
    password: "admin123",
    nome: "Super Admin",
    platformRole: "SUPER_ADMIN",
  },
  {
    id: "user-operacional",
    email: "operacional@demo.com",
    password: "demo123",
    nome: "Maria Operacional",
    tenantMemberships: [{ tenantId: "tenant-demo", tenantSlug: "demo", role: "OPERATIONAL" }],
  },
  {
    id: "user-operacional-acme",
    email: "operacional@acme.com",
    password: "demo123",
    nome: "Carlos Acme",
    tenantMemberships: [{ tenantId: "tenant-acme", tenantSlug: "acme", role: "ADMIN" }],
  },
  {
    id: "user-cliente",
    email: "cliente@demo.com",
    password: "demo123",
    nome: "João Cliente",
    clientRole: "CLIENT",
    clientId: "client-001",
    tenantSlug: "demo",
    tenantId: "tenant-demo",
  },
  {
    id: "user-cliente-acme",
    email: "cliente@acme.com",
    password: "demo123",
    nome: "Ana Acme",
    clientRole: "CLIENT",
    clientId: "client-acme-001",
    tenantSlug: "acme",
    tenantId: "tenant-acme",
  },
];

export function findMockUser(email: string, password: string): SessionUser | null {
  const normalized = email.trim().toLowerCase();
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalized && u.password === password,
  );
  if (!user) return null;

  const { password: _, ...sessionUser } = user;
  return sessionUser;
}

function portalLabel(user: MockUserRecord): string {
  if (user.platformRole === "SUPER_ADMIN") return "Admin plataforma";
  if (user.clientRole === "CLIENT") return `Cliente (${user.tenantSlug})`;
  const slug = user.tenantMemberships?.[0]?.tenantSlug ?? "app";
  return `Operacional (${slug})`;
}

export const MOCK_LOGIN_HINTS = MOCK_USERS.map(({ email, password, nome, ...rest }) => ({
  email,
  password,
  nome,
  tipo: portalLabel({ email, password, nome, ...rest } as MockUserRecord),
}));

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
    id: "user-cliente",
    email: "cliente@demo.com",
    password: "demo123",
    nome: "João Cliente",
    clientRole: "CLIENT",
    clientId: "client-001",
    tenantSlug: "demo",
    tenantId: "tenant-demo",
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

export const MOCK_LOGIN_HINTS = MOCK_USERS.map(
  ({ email, password, nome, platformRole, clientRole }) => ({
    email,
    password,
    nome,
    tipo: platformRole ?? clientRole ?? "OPERATIONAL",
  }),
);

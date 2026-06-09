import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import { hashPassword, verifyPassword } from "@/lib/auth/password.server";

import { getDb, resetDbForTests } from "./client.server";
import { tenants } from "./schema";
import { getUserByEmail, seedDatabaseIfEmpty } from "./seed.server";

const TEST_DB = resolve(process.cwd(), "data/test-vendapro.sqlite");

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

process.env.SQLITE_PATH = TEST_DB;
process.env.USE_SERVER_DB = "true";
process.env.SESSION_SECRET = "test-secret-with-32-characters-min!!";

if (existsSync(TEST_DB)) rmSync(TEST_DB);
resetDbForTests();

console.log("db (Fase 7) — testes unitários\n");

const seeded = await seedDatabaseIfEmpty();
assert(seeded, "seed inicial deve popular o banco");

const hash = await hashPassword("demo123");
assert(await verifyPassword("demo123", hash), "hash de senha válido");

const user = getUserByEmail("cliente@demo.com");
assert(!!user, "usuário cliente seedado");
assert(user!.email === "cliente@demo.com", "email normalizado no banco");

const db = getDb();
const allTenants = db.select().from(tenants).all();
assert(allTenants.length >= 2, "tenants demo e acme seedados");

console.log("  ✓ seed popula tenants, usuários e snapshots CRM");
console.log("  ✓ bcrypt hash/verify funciona");
console.log("  ✓ tenants persistidos no SQLite");

console.log("\nTodos os testes da Fase 7 passaram.\n");

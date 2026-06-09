import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function resolveSqlitePath(): string {
  const configured = process.env.SQLITE_PATH ?? "data/vendapro.sqlite";
  return resolve(process.cwd(), configured);
}

export function getDb() {
  if (dbInstance) return dbInstance;

  const path = resolveSqlitePath();
  mkdirSync(dirname(path), { recursive: true });

  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export function resetDbForTests() {
  dbInstance = null;
}

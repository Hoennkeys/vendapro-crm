import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  status: text("status").notNull().default("active"),
  plan: text("plan").notNull().default("starter"),
  whiteLabelJson: text("white_label_json").notNull(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nome: text("nome").notNull(),
  platformRole: text("platform_role"),
  clientRole: text("client_role"),
  clientId: text("client_id"),
  tenantId: text("tenant_id"),
  tenantSlug: text("tenant_slug"),
});

export const tenantMemberships = sqliteTable("tenant_memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tenantId: text("tenant_id").notNull(),
  tenantSlug: text("tenant_slug").notNull(),
  role: text("role").notNull(),
});

/** Estado CRM serializado por tenant (substitui localStorage global). */
export const tenantCrmState = sqliteTable("tenant_crm_state", {
  tenantId: text("tenant_id").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});

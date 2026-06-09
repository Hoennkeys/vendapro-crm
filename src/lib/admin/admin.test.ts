import assert from "node:assert/strict";

import {
  computePlatformMetrics,
  createPlatformTenant,
  deletePlatformTenant,
  getPlatformTenantById,
  getPlatformTenantBySlug,
  isValidSlug,
  listPlatformTenants,
  slugify,
  updatePlatformTenant,
} from "./tenant-registry";
import { isValidTenantSlug } from "@/lib/tenant/mock-tenants";
import { loadTenantWhiteLabel } from "@/lib/tenant/storage";

const REGISTRY_KEY = "vendapro_platform_tenants_v1";

const memoryStore = new Map<string, string>();

function installBrowserGlobals() {
  (globalThis as { window?: object }).window = {};
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return memoryStore.size;
    },
    clear() {
      memoryStore.clear();
    },
    getItem(key: string) {
      return memoryStore.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      memoryStore.set(key, value);
    },
    removeItem(key: string) {
      memoryStore.delete(key);
    },
    key(index: number) {
      return [...memoryStore.keys()][index] ?? null;
    },
  };
}

function removeBrowserGlobals() {
  delete (globalThis as { window?: object }).window;
  delete (globalThis as { localStorage?: Storage }).localStorage;
}

function resetRegistry() {
  memoryStore.clear();
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("admin (Fase 5) — testes unitários\n");

test("slugify normaliza acentos e espaços", () => {
  assert.equal(slugify("  Tech Solutions  "), "tech-solutions");
  assert.equal(slugify("São Paulo Ltda"), "sao-paulo-ltda");
  assert.equal(slugify("A&B Corp!!!"), "a-b-corp");
});

test("isValidSlug rejeita slugs inválidos", () => {
  assert.equal(isValidSlug("ab"), true);
  assert.equal(isValidSlug("a"), false);
  assert.equal(isValidSlug("UPPER"), false);
  assert.equal(isValidSlug("-invalid"), false);
  assert.equal(isValidSlug("valid-slug-2"), true);
});

test("seed inicial contém demo e acme como sistema", () => {
  installBrowserGlobals();
  resetRegistry();

  const tenants = listPlatformTenants();
  assert.equal(tenants.length, 2);
  assert.ok(tenants.every((t) => t.isSystem));
  assert.ok(getPlatformTenantBySlug("demo"));
  assert.ok(getPlatformTenantBySlug("acme"));
  assert.equal(getPlatformTenantById("tenant-demo")?.nome, "Demo Corp");

  removeBrowserGlobals();
});

test("createPlatformTenant persiste e sincroniza white label", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  const created = createPlatformTenant({
    nome: "Tech Solutions",
    slug: "tech-solutions",
    plan: "pro",
  });

  assert.equal(created.slug, "tech-solutions");
  assert.equal(created.status, "trial");
  assert.equal(created.plan, "pro");
  assert.equal(listPlatformTenants().length, 3);

  const wlRaw = memoryStore.get("vendapro_tenant_tech-solutions_v1");
  assert.ok(wlRaw);
  assert.match(wlRaw, /Tech Solutions/);

  removeBrowserGlobals();
});

test("createPlatformTenant rejeita slug duplicado", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  createPlatformTenant({ nome: "Primeira", slug: "empresa-x" });
  assert.throws(
    () => createPlatformTenant({ nome: "Segunda", slug: "empresa-x" }),
    /Já existe um tenant/,
  );

  removeBrowserGlobals();
});

test("createPlatformTenant rejeita slug inválido", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  assert.throws(() => createPlatformTenant({ nome: "X", slug: "x" }), /Slug inválido/);

  removeBrowserGlobals();
});

test("updatePlatformTenant atualiza nome, status e white label", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  const created = createPlatformTenant({ nome: "Original", slug: "original-co" });
  const updated = updatePlatformTenant(created.id, {
    nome: "Renomeado",
    status: "active",
    whiteLabel: {
      ...created.whiteLabel,
      nome: "Renomeado Portal",
      cores: { primary: "oklch(0.65 0.2 45)", primaryForeground: "oklch(0.99 0 0)" },
    },
  });

  assert.equal(updated.nome, "Renomeado");
  assert.equal(updated.status, "active");
  assert.equal(updated.whiteLabel.nome, "Renomeado Portal");
  assert.equal(getPlatformTenantById(created.id)?.nome, "Renomeado");

  removeBrowserGlobals();
});

test("deletePlatformTenant remove custom mas bloqueia sistema", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  const custom = createPlatformTenant({ nome: "Temp", slug: "temp-co" });
  memoryStore.set("vendapro_tenant_temp-co_v1", "{}");

  deletePlatformTenant(custom.id);
  assert.equal(getPlatformTenantBySlug("temp-co"), null);
  assert.equal(memoryStore.get("vendapro_tenant_temp-co_v1"), undefined);
  assert.equal(listPlatformTenants().length, 2);

  assert.throws(
    () => deletePlatformTenant("tenant-demo"),
    /Tenants do sistema não podem ser excluídos/,
  );
  assert.throws(() => deletePlatformTenant("inexistente"), /Tenant não encontrado/);

  removeBrowserGlobals();
});

test("computePlatformMetrics calcula MRR apenas de tenants ativos", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  const metrics = computePlatformMetrics(5);
  assert.equal(metrics.totalTenants, 2);
  assert.equal(metrics.activeTenants, 2);
  assert.equal(metrics.totalUsers, 5);
  assert.equal(metrics.mrrEstimate, 99 + 299);

  createPlatformTenant({ nome: "Trial Co", slug: "trial-co", status: "trial" });
  const afterTrial = computePlatformMetrics(5);
  assert.equal(afterTrial.totalTenants, 3);
  assert.equal(afterTrial.trialTenants, 1);
  assert.equal(afterTrial.mrrEstimate, 99 + 299);

  removeBrowserGlobals();
});

test("isValidTenantSlug e loadTenantWhiteLabel reconhecem tenant criado", () => {
  installBrowserGlobals();
  resetRegistry();
  listPlatformTenants();

  assert.equal(isValidTenantSlug("novo-cliente"), false);
  createPlatformTenant({ nome: "Novo Cliente", slug: "novo-cliente" });
  assert.equal(isValidTenantSlug("novo-cliente"), true);

  const wl = loadTenantWhiteLabel("novo-cliente");
  assert.equal(wl.nome, "Novo Cliente");
  assert.equal(wl.slug, "novo-cliente");

  removeBrowserGlobals();
});

test("registry corrompido no localStorage é re-seedado", () => {
  installBrowserGlobals();
  resetRegistry();
  memoryStore.set(REGISTRY_KEY, "not-json");

  const tenants = listPlatformTenants();
  assert.equal(tenants.length, 2);
  assert.ok(getPlatformTenantBySlug("demo"));

  removeBrowserGlobals();
});

console.log("\nTodos os testes da Fase 5 passaram.\n");

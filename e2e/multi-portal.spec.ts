import { expect, test, type Page } from "@playwright/test";

const REGISTRY_KEY = "vendapro_platform_tenants_v1";

async function clearAppStorage(page: Page) {
  await page.goto("/login");
  await page.evaluate((key) => {
    localStorage.clear();
    sessionStorage.clear();
  }, REGISTRY_KEY);
}

async function loginAsSuperAdmin(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Super Admin/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard da Plataforma" })).toBeVisible();
}

async function loginAsOperational(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Maria Operacional/i }).click();
  await page.waitForURL(/\/t\/demo\/app\/painel/, { timeout: 15_000 });
}

test.describe("Fase 5 — Portal Admin", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test("super-admin acessa dashboard com métricas", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await expect(page.getByText("Tenants", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Usuários", { exact: true })).toBeVisible();
    await expect(page.getByText("MRR")).toBeVisible();
  });

  test("CRUD tenant: criar, editar e excluir", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.getByRole("navigation").getByRole("link", { name: "Tenants", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/tenants\/?$/);

    await page.getByRole("button", { name: "Novo tenant" }).click();
    await page.getByLabel("Nome da empresa").fill("E2E Test Corp");
    await page.getByLabel("Slug").fill("e2e-test-corp");
    await page.getByRole("button", { name: "Criar tenant" }).click();

    await expect(page.getByRole("link", { name: "E2E Test Corp" })).toBeVisible();
    await expect(page.getByText("e2e-test-corp")).toBeVisible();

    await page.getByRole("link", { name: "E2E Test Corp" }).click();
    await expect(page).toHaveURL(/\/admin\/tenants\/tenant-e2e-test-corp/);

    await page.getByLabel("Nome da empresa").fill("E2E Renomeado");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page.getByRole("navigation").getByRole("link", { name: "Tenants", exact: true }).click();
    await expect(page.getByRole("link", { name: "E2E Renomeado" })).toBeVisible();

    const row = page.getByRole("row", { name: /E2E Renomeado/ });
    await row.getByRole("button", { name: "Excluir tenant" }).click();
    await page.getByRole("button", { name: "Excluir" }).click();

    await expect(page.getByRole("link", { name: "E2E Renomeado" })).not.toBeVisible();
  });

  test("tenant criado persiste no registry e aparece no billing", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.getByRole("navigation").getByRole("link", { name: "Tenants", exact: true }).click();
    await page.getByRole("button", { name: "Novo tenant" }).click();
    await page.getByLabel("Nome da empresa").fill("Portal E2E");
    await page.getByLabel("Slug").fill("portal-e2e");
    await page.getByRole("button", { name: "Criar tenant" }).click();

    await expect(page.getByRole("link", { name: "Portal E2E" })).toBeVisible();

    const hasTenant = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const list = JSON.parse(raw) as Array<{ slug: string }>;
      return list.some((t) => t.slug === "portal-e2e");
    }, REGISTRY_KEY);
    expect(hasTenant).toBe(true);

    await page.getByRole("navigation").getByRole("link", { name: "Billing", exact: true }).click();
    await expect(page.getByRole("link", { name: "Portal E2E" })).toBeVisible();
  });

  test("billing exibe MRR e tabela por tenant", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.getByRole("navigation").getByRole("link", { name: "Billing", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/billing/);
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(page.getByText("MRR estimado")).toBeVisible();
    await expect(page.getByRole("link", { name: "Demo Corp" })).toBeVisible();
  });

  test("usuário operacional não acessa admin", async ({ page }) => {
    await loginAsOperational(page);
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin\/?$/);
  });
});

test.describe("Fase 4 — Pipelines modulares", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test("lista pipelines e abre kanban de Vendas", async ({ page }) => {
    await loginAsOperational(page);
    await page.goto("/t/demo/app/funil");
    await expect(page.getByRole("heading", { name: "Pipelines" })).toBeVisible();
    await expect(page.getByText("Vendas", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: /Abrir kanban/i }).click();
    await expect(page).toHaveURL(/\/t\/demo\/app\/funil\/pipeline-vendas/);
    await expect(page.getByText("Sem Contato").first()).toBeVisible({ timeout: 15_000 });
  });

  test("redirect legado /funil exige auth e preserva destino", async ({ page }) => {
    await page.goto("/funil");
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.url()).toContain("funil");
  });
});

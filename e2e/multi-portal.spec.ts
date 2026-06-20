import { expect, test } from "@playwright/test";
import {
  clearAppStorage,
  loginAsClient,
  loginAsOperational,
  loginAsSuperAdmin,
} from "./helpers";

test.describe("Fase 5 — Portal Admin", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test("super-admin acessa dashboard com métricas", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await expect(page.getByRole("heading", { name: "Dashboard da Plataforma" })).toBeVisible();
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
    const uniqueSlug = `portal-e2e-${Date.now()}`;
    const uniqueName = `Portal E2E ${Date.now()}`;

    await loginAsSuperAdmin(page);
    await page.getByRole("navigation").getByRole("link", { name: "Tenants", exact: true }).click();
    await page.getByRole("button", { name: "Novo tenant" }).click();
    await page.getByLabel("Nome da empresa").fill(uniqueName);
    await page.getByLabel("Slug").fill(uniqueSlug);
    await page.getByRole("button", { name: "Criar tenant" }).click();

    await expect(page.getByRole("link", { name: uniqueName })).toBeVisible({ timeout: 10_000 });

    await page.getByRole("navigation").getByRole("link", { name: "Billing", exact: true }).click();
    await expect(page.getByRole("link", { name: uniqueName })).toBeVisible();
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

test.describe("Fase 6 — Portal Cliente", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test("cliente acessa portal e vê apenas seus registros", async ({ page }) => {
    await loginAsClient(page);
    await expect(page.getByRole("heading", { name: /Bem-vindo, João Cliente/i })).toBeVisible();
    await expect(page.getByText("2 registro(s)").first()).toBeVisible();

    await page.getByRole("navigation").getByRole("link", { name: "Propostas" }).click();
    await expect(page).toHaveURL(/\/t\/demo\/portal\/propostas/);
    await expect(page.getByText("PROP-2026-001")).toBeVisible();
    await expect(page.getByText("PROP-2026-002")).toBeVisible();
    await expect(page.getByText("PROP-2026-101")).not.toBeVisible();

    await page.getByRole("navigation").getByRole("link", { name: "Projetos" }).click();
    await expect(page.getByText("Redesign do site institucional")).toBeVisible();
    await expect(page.getByText("Automação linha de produção")).not.toBeVisible();

    await page.getByRole("navigation").getByRole("link", { name: "Chamados" }).click();
    await expect(page.getByText("Dúvida sobre fatura")).toBeVisible();
    await expect(page.getByText("Problema na integração")).not.toBeVisible();

    await page.getByRole("navigation").getByRole("link", { name: "Faturamento" }).click();
    await expect(page.getByText("FAT-2026-001")).toBeVisible();
    await expect(page.getByText("FAT-2026-101")).not.toBeVisible();
  });

  test("cliente pode abrir novo chamado", async ({ page }) => {
    const titulo = `Teste E2E chamado ${Date.now()}`;

    await loginAsClient(page);
    await page.getByRole("navigation").getByRole("link", { name: "Chamados" }).click();
    await page.getByRole("button", { name: "Abrir chamado" }).click();
    await page.getByLabel("Título").fill(titulo);
    await page.getByLabel("Descrição").fill("Descrição do chamado de teste automatizado.");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(titulo)).toBeVisible();
  });

  test("usuário operacional não acessa portal cliente", async ({ page }) => {
    await loginAsOperational(page);
    await page.goto("/t/demo/portal");
    await expect(page).not.toHaveURL(/\/t\/demo\/portal\/?$/);
  });

  test("cliente demo não acessa portal acme", async ({ page }) => {
    await loginAsClient(page);
    await page.goto("/t/acme/portal");
    await expect(page).not.toHaveURL(/\/t\/acme\/portal/);
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

    await page.getByRole("link", { name: /Abrir kanban/i }).first().click();
    await expect(page).toHaveURL(/\/t\/demo\/app\/funil\/pipeline-vendas/);
    await expect(page.getByText("Sem Contato").first()).toBeVisible({ timeout: 15_000 });
  });

  test("redirect legado /funil exige auth e preserva destino", async ({ page }) => {
    await page.goto("/funil");
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.url()).toContain("funil");
  });
});

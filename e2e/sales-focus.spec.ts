import { expect, test } from "@playwright/test";
import {
  appSidebar,
  clearAppStorage,
  loginAsOperational,
  POS_VENDA_STORAGE_KEY,
} from "./helpers";

test.describe("Reforma comercial — sidebar e Comunicação", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await loginAsOperational(page);
  });

  test("sidebar comercial prioriza vendas e oculta Propostas", async ({ page }) => {
    const sidebar = appSidebar(page);

    await expect(sidebar.getByText("Comercial", { exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Painel" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Funil de Vendas" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Comunicação" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Agenda" })).toBeVisible();

    await expect(sidebar.getByRole("link", { name: "Chats" })).not.toBeVisible();
    await expect(sidebar.getByRole("link", { name: "E-mails" })).not.toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Propostas" })).not.toBeVisible();
  });

  test("seção Pós-Venda colapsa e expande com persistência", async ({ page }) => {
    const sidebar = appSidebar(page);
    const trigger = sidebar.getByRole("button", { name: /Pós-Venda & Operações/i });

    await expect(trigger).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Chamados" })).not.toBeVisible();

    await trigger.click();
    await expect(sidebar.getByRole("link", { name: "Chamados" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Faturamento" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Projetos" })).toBeVisible();

    await page.reload();
    await expect(sidebar.getByRole("link", { name: "Chamados" })).toBeVisible();

    const persisted = await page.evaluate(
      (key) => localStorage.getItem(key),
      POS_VENDA_STORAGE_KEY,
    );
    expect(persisted).toBe("true");
  });

  test("navega para Comunicação com abas Chats e E-mails", async ({ page }) => {
    const sidebar = appSidebar(page);
    await sidebar.getByRole("link", { name: "Comunicação" }).click();

    await expect(page).toHaveURL(/\/t\/demo\/app\/comunicacao/);
    await expect(page.getByRole("heading", { name: "Comunicação" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Chats/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /E-mails/i })).toBeVisible();

    await page.getByRole("tab", { name: /E-mails/i }).click();
    await expect(page).toHaveURL(/tab=emails/);
    await expect(page.getByRole("button", { name: /Escrever/i })).toBeVisible();
  });

  test("redirects de chats e emails preservam destino na Comunicação", async ({ page }) => {
    await page.goto("/t/demo/app/chats");
    await expect(page).toHaveURL(/\/t\/demo\/app\/comunicacao/);
    await expect(page.getByRole("tab", { name: /Chats/i })).toHaveAttribute("data-state", "active");

    await page.goto("/t/demo/app/emails");
    await expect(page).toHaveURL(/tab=emails/);
    await expect(page.getByRole("tab", { name: /E-mails/i })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("rota /propostas permanece acessível fora do menu", async ({ page }) => {
    const sidebar = appSidebar(page);
    await expect(sidebar.getByRole("link", { name: "Propostas" })).not.toBeVisible();

    await page.goto("/t/demo/app/propostas");
    await expect(page.getByRole("heading", { name: "Gerador de Propostas" })).toBeVisible();
  });

  test("acesso direto a Chamados expande Pós-Venda automaticamente", async ({ page }) => {
    await page.goto("/t/demo/app/chamados");
    const sidebar = appSidebar(page);

    await expect(page.getByRole("heading", { name: /Chamados de Suporte/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Chamados" })).toBeVisible();
  });
});

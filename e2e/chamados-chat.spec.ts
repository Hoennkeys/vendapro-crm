import { expect, test } from "@playwright/test";

import { clearAppStorage, loginAsOperational } from "./helpers";

const DEMO_CRM_STORAGE_KEY = "vendapro_crm_state_v3_tenant-demo";

test.describe("Integração Chamados → Inbox", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await loginAsOperational(page);
  });

  test("Atender Cliente abre inbox com mensagem contextual pré-preenchida", async ({ page }) => {
    await page.goto("/t/demo/app/chamados");
    await expect(page.getByRole("heading", { name: /Chamados de Suporte/i })).toBeVisible();

    await page
      .getByRole("link", { name: /Atender Cliente/i })
      .filter({ hasText: /Atender Cliente/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/t\/demo\/app\/communications\/inbox/);

    const messageInput = page.getByPlaceholder("Digite uma mensagem...");
    await expect(messageInput).toHaveValue(/Dúvida sobre fatura/);
    await expect(messageInput).toHaveValue(/Olá, João Cliente!/);
    await expect(messageInput).toHaveValue(/Já estou analisando o seu caso/);
  });

  test("cria conversa automaticamente quando cliente não possui chat", async ({ page }) => {
    await page.goto("/t/demo/app/chamados");
    await expect(page.getByRole("heading", { name: /Chamados de Suporte/i })).toBeVisible();

    await page.evaluate((storageKey) => {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const state = JSON.parse(raw) as { conversas?: unknown[] };
      state.conversas = [];
      localStorage.setItem(storageKey, JSON.stringify(state));
    }, DEMO_CRM_STORAGE_KEY);

    await page.reload();
    await expect(page.getByRole("heading", { name: /Chamados de Suporte/i })).toBeVisible();

    await page.getByRole("link", { name: /Atender Cliente/i }).first().click();

    await expect(page).toHaveURL(/\/t\/demo\/app\/communications\/inbox/);

    const messageInput = page.getByPlaceholder("Digite uma mensagem...");
    await expect(messageInput).toHaveValue(/Olá, João Cliente!/);
    await expect(page.getByText("Selecione uma conversa no Inbox omnichannel")).not.toBeVisible();
  });
});

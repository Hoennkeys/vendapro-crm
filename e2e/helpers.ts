import type { Page } from "@playwright/test";

const REGISTRY_KEY = "vendapro_platform_tenants_v1";

export const POS_VENDA_STORAGE_KEY = "sidebar-posvenda-open";

export async function clearAppStorage(page: Page) {
  await page.goto("/login");
  await page.context().clearCookies();
  await page.evaluate((key) => {
    localStorage.clear();
    sessionStorage.clear();
  }, REGISTRY_KEY);
}

async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
  expectedUrl: RegExp,
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(expectedUrl, { timeout: 15_000 });
}

export async function loginAsSuperAdmin(page: Page) {
  await loginWithCredentials(page, "admin@vendapro.app", "admin123", /\/admin/);
}

export async function loginAsOperational(page: Page) {
  await loginWithCredentials(page, "operacional@demo.com", "demo123", /\/t\/demo\/app\/painel/);
}

export async function loginAsClient(page: Page) {
  await loginWithCredentials(page, "cliente@demo.com", "demo123", /\/t\/demo\/portal/);
}

export function appSidebar(page: Page) {
  return page.locator('[data-sidebar="sidebar"]');
}

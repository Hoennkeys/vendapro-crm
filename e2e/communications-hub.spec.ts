import { test, expect } from "@playwright/test";
import { loginAsOperational } from "./helpers";

test.describe("Communication Hub — rotas legadas", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOperational(page);
  });

  test("/communications redireciona para inbox", async ({ page }) => {
    await page.goto("/t/demo/app/communications");
    await expect(page).toHaveURL(/\/t\/demo\/app\/communications\/inbox/);
  });

  test("root /chats redireciona para inbox internal", async ({ page }) => {
    await page.goto("/chats");
    await expect(page).toHaveURL(/\/communications\/inbox/);
    await expect(page).toHaveURL(/channel=internal/);
  });

  test("/comunicacao redireciona para /communications/inbox", async ({ page }) => {
    await page.goto("/t/demo/app/comunicacao");
    await expect(page).toHaveURL(/\/t\/demo\/app\/communications\/inbox/);
  });

  test("/comunicacao?tab=emails preserva channel=email", async ({ page }) => {
    await page.goto("/t/demo/app/comunicacao?tab=emails");
    await expect(page).toHaveURL(/\/communications\/inbox/);
    await expect(page).toHaveURL(/channel=email/);
  });

  test("/chats redireciona para inbox internal", async ({ page }) => {
    await page.goto("/t/demo/app/chats");
    await expect(page).toHaveURL(/\/communications\/inbox/);
    await expect(page).toHaveURL(/channel=internal/);
  });

  test("/emails redireciona para inbox email", async ({ page }) => {
    await page.goto("/t/demo/app/emails");
    await expect(page).toHaveURL(/\/communications\/inbox/);
    await expect(page).toHaveURL(/channel=email/);
  });

  test("hub exibe título Comunicações", async ({ page }) => {
    await page.goto("/t/demo/app/communications/inbox");
    await expect(page.getByRole("heading", { name: "Comunicações" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inbox" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Integrações" })).toBeVisible();
  });
});

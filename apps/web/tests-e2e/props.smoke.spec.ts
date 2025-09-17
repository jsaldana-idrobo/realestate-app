// apps/web/tests-e2e/props.smoke.spec.ts
import { expect, test } from "@playwright/test";

test("flujo básico: listar → filtrar → detalle → volver", async ({ page }) => {
  // 1) Listado
  await page.goto("/properties");
  await page.waitForLoadState("networkidle");

  // Header visible y al menos una card
  await expect(
    page.getByRole("heading", { name: /real estate/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();

  // Garantiza que existe un link a detalle
  await expect(page.locator('a[href^="/properties/"]').first()).toBeVisible();

  // 2) Filtrar por Name
  await page.getByPlaceholder("Name").fill("Park");
  await expect(page).toHaveURL(/\/properties\?.*name=Park/);
  await page.waitForLoadState("networkidle");

  // Relee el primer link tras filtrar
  const firstDetailLink = page.locator('a[href^="/properties/"]').first();
  await expect(firstDetailLink).toBeVisible();

  // 3) Entrar al detalle (aceptando que haya query string)
  const detailUrlRegex = /\/properties\/[^/?#]+\/?(?:\?.*)?$/;
  await Promise.all([page.waitForURL(detailUrlRegex), firstDetailLink.click()]);

  // Confirmamos contenido del detalle
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByText(/\$\d{1,3}(,\d{3})*/)).toBeVisible();

  // 4) Volver y conservar QS
  const back = page.getByRole("link", { name: /volver/i });
  await expect(back).toBeVisible();
  await Promise.all([page.waitForURL(/\/properties(?:\?.*)?$/), back.click()]);

  // Siguimos viendo la lista y (opcional) el filtro aplicado
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await expect(page).toHaveURL(/\/properties(?:\?.*)?$/);
});

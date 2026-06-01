import { expect, test } from "@playwright/test";

test("Extended module entry forms create persisted records from the UI", async ({ page }) => {
  const marker = `PW_EXT_${Date.now()}`;

  await page.goto("/login");
  await page.locator('input[name="username"]').fill("pm");
  await page.locator('input[name="password"]').fill("123456");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/machinery/new");
  await page.getByLabel("Equipment name").fill(`${marker}_MACHINE`);
  await page.getByLabel("Equipment code").fill(`${marker}_MC`);
  await page.getByRole("button", { name: "Submit registration" }).click();
  await expect(page).toHaveURL(/\/machinery\/.+/);
  await expect(page.getByText(`${marker}_MACHINE`)).toBeVisible();

  await page.goto("/safety/hazards/new");
  await page.getByLabel("Hazard title").fill(`${marker}_HAZARD`);
  await page.getByRole("button", { name: "Submit hazard" }).click();
  await expect(page).toHaveURL(/\/safety\/hazards\/.+/);
  await expect(page.getByText(`${marker}_HAZARD`)).toBeVisible();

  await page.goto("/safety/incidents/new");
  await page.getByLabel("Incident title").fill(`${marker}_INCIDENT`);
  await page.getByRole("button", { name: "Submit incident" }).click();
  await expect(page).toHaveURL(/\/safety\/incidents\/.+/);
  await expect(page.getByText(`${marker}_INCIDENT`)).toBeVisible();

  await page.goto("/archive/new");
  await page.getByLabel("Archive title").fill(`${marker}_ARCHIVE`);
  await page.getByRole("button", { name: "Submit archive" }).click();
  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByText(`${marker}_ARCHIVE`)).toBeVisible();

  await page.goto("/change-visa/changes/new");
  await page.getByLabel("Change title").fill(`${marker}_CHANGE`);
  await page.getByRole("button", { name: "Submit change" }).click();
  await expect(page).toHaveURL(/\/change-visa/);
  await expect(page.getByText(`${marker}_CHANGE`)).toBeVisible();

  await page.goto("/change-visa/visas/new");
  await page.getByLabel("Visa title").fill(`${marker}_VISA`);
  await page.getByRole("button", { name: "Submit visa" }).click();
  await expect(page).toHaveURL(/\/change-visa/);
  await expect(page.getByText(`${marker}_VISA`)).toBeVisible();
});

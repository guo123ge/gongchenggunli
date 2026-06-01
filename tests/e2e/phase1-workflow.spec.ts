import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

async function jsonRequest<T>(request: APIRequestContext, path: string, init?: Parameters<APIRequestContext["fetch"]>[1]) {
  const response = await request.fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  expect(response.ok(), `${path} returned ${response.status()}: ${JSON.stringify(body)}`).toBeTruthy();
  expect(body.ok, `${path} body indicates failure: ${JSON.stringify(body)}`).not.toBe(false);
  return body.data as T;
}

async function browserJsonRequest<T>(page: Page, path: string, payload: unknown) {
  const result = await page.evaluate(
    async ({ requestPath, requestPayload }) => {
      const response = await fetch(requestPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      return { ok: response.ok, status: response.status, body: await response.json() };
    },
    { requestPath: path, requestPayload: payload },
  );
  expect(result.ok, `${path} returned ${result.status}: ${JSON.stringify(result.body)}`).toBeTruthy();
  expect(result.body.ok, `${path} body indicates failure: ${JSON.stringify(result.body)}`).not.toBe(false);
  return result.body.data as T;
}

test("Phase 1 browser workflow: login, review, stock update, page visibility", async ({ page, request }) => {
  const marker = `PW_PHASE1_${Date.now()}`;

  await page.goto("/login");
  await page.locator('input[name="username"]').fill("pm");
  await page.locator('input[name="password"]').fill("123456");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);

  const dailyLog = await jsonRequest<{ id: string; workPosition: string; workContent: string }>(request, "/api/daily-logs", {
    method: "POST",
    data: {
      projectId: "p-demo",
      workDate: "2026-06-01",
      weather: "晴",
      tempLow: 21,
      tempHigh: 30,
      workContent: `${marker}_LOG_CONTENT`,
      workPosition: `${marker}_POSITION`,
      workProcess: `${marker}_PROCESS`,
      laborCount: 9,
      laborDetail: [{ type: "Verifier", count: 9 }],
      machineryUsed: [],
      materialUsed: [],
      status: "submitted",
    },
  });

  const materialsBefore = await jsonRequest<Array<{ id: string; currentStock: number }>>(request, "/api/materials");
  const materialBefore = materialsBefore.find((item) => item.id === "mat-001");
  expect(materialBefore, "seed material mat-001 should exist").toBeTruthy();

  const stockIn = await jsonRequest<{ id: string; billNo: string }>(request, "/api/materials/stock-in", {
    method: "POST",
    data: {
      materialId: "mat-001",
      billNo: `${marker}_STOCK_IN`,
      quantity: 3,
      supplier: "Playwright supplier",
    },
  });

  await page.goto("/review");
  await expect(page.getByText(dailyLog.workPosition)).toBeVisible();

  await browserJsonRequest(page, "/api/review", {
    targetType: "daily-log",
    targetId: dailyLog.id,
    action: "approve",
    comment: "Approved by Playwright E2E",
  });

  await browserJsonRequest(page, "/api/review", {
    targetType: "material",
    targetId: stockIn.id,
    action: "approve",
    comment: "Approved by Playwright E2E",
  });

  const materialsAfter = await jsonRequest<Array<{ id: string; currentStock: number }>>(request, "/api/materials");
  const materialAfter = materialsAfter.find((item) => item.id === "mat-001");
  expect(materialAfter?.currentStock).toBe((materialBefore?.currentStock ?? 0) + 3);

  await page.goto("/daily-log");
  await expect(page.getByText(dailyLog.workPosition)).toBeVisible();
  await page.goto(`/daily-log/${dailyLog.id}`);
  await expect(page.getByText(dailyLog.workContent)).toBeVisible();

  await page.goto("/material/stock-in");
  await expect(page.getByText(stockIn.billNo)).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText(dailyLog.workPosition).first()).toBeVisible();
});

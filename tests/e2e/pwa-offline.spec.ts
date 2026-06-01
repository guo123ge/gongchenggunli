import { expect, test } from "@playwright/test";

test("PWA shell registers service worker and flushes offline sync queue", async ({ page, request }) => {
  const marker = `PW_PWA_${Date.now()}`;

  await page.goto("/login");
  await page.locator('input[name="username"]').fill("pm");
  await page.locator('input[name="password"]').fill("123456");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.json");
  const swUrl = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return null;

    const windowWithSwReady = window as Window & {
      __CSP_SW_READY__?: Promise<ServiceWorkerRegistration | null>;
    };
    const registrationPromise =
      windowWithSwReady.__CSP_SW_READY__ ??
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready);
    const registration = await Promise.race([
      registrationPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
    ]);

    return (
      registration?.active?.scriptURL ??
      registration?.waiting?.scriptURL ??
      registration?.installing?.scriptURL ??
      null
    );
  });
  expect(swUrl).toContain("/sw.js");

  await page.evaluate(async (name) => {
    const openRequest = indexedDB.open("construction-site-platform");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readwrite");
      transaction.objectStore("syncQueue").add({
        id: crypto.randomUUID(),
        method: "POST",
        url: "/api/materials",
        payload: {
          projectId: "p-demo",
          name,
          category: "pwa",
          spec: "offline-sync",
          unit: "pcs",
          safetyStock: 1,
        },
        createdAt: new Date().toISOString(),
        status: "pending",
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    window.dispatchEvent(new Event("online"));
  }, `${marker}_MATERIAL`);

  await expect
    .poll(async () => {
      const response = await request.get("/api/materials");
      const body = await response.json();
      return body.data.some((item: { name: string }) => item.name === `${marker}_MATERIAL`);
    })
    .toBe(true);

  const pendingCount = await page.evaluate(async () => {
    const openRequest = indexedDB.open("construction-site-platform");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
    });
    const count = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readonly");
      const index = transaction.objectStore("syncQueue").index("status");
      const request = index.count("pending");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return count;
  });
  expect(pendingCount).toBe(0);
});

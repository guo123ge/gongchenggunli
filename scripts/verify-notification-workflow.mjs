const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

const material = await requestJson("/api/materials", {
  method: "POST",
  body: JSON.stringify({
    projectId: "p-demo",
    name: `NOTICE_LOW_STOCK_${Date.now()}`,
    category: "verify",
    spec: "notification",
    unit: "pcs",
    safetyStock: 10,
  }),
});

const hazard = await requestJson("/api/safety/hazards", {
  method: "POST",
  body: JSON.stringify({
    title: `NOTICE_OPEN_HAZARD_${Date.now()}`,
    area: "Notification verification area",
    riskLevel: "high",
    dueDate: "2026-06-03",
  }),
});

const notices = await requestJson("/api/notifications");
const stockNotice = notices.find((item) => item.id === `stock-${material.id}`);
const safetyNotice = notices.find((item) => item.id === `safety-${hazard.id}`);

if (!stockNotice) throw new Error("low-stock material did not generate a notification");
if (!safetyNotice) throw new Error("open hazard did not generate a notification");

console.log(
  JSON.stringify(
    {
      ok: true,
      materialId: material.id,
      hazardId: hazard.id,
      noticeCount: notices.length,
      stockNotice: stockNotice.title,
      safetyNotice: safetyNotice.title,
    },
    null,
    2,
  ),
);

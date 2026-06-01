const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const marker = `REPORT_BIND_${Date.now()}`;

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

async function requestText(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} failed: HTTP ${response.status} ${text}`);
  return text;
}

const existingLogs = await requestJson("/api/daily-logs");
const weather = existingLogs.items?.[0]?.weather;
if (!weather) throw new Error("No existing daily log weather value is available for report verification");

const dailyLog = await requestJson("/api/daily-logs", {
  method: "POST",
  body: JSON.stringify({
    projectId: "p-demo",
    workDate: "2026-06-01",
    weather,
    tempLow: 22,
    tempHigh: 31,
    workContent: `${marker}_LOG_CONTENT`,
    workPosition: `${marker}_POSITION`,
    workProcess: `${marker}_PROCESS`,
    laborCount: 7,
    laborDetail: [{ type: "Verifier", count: 7 }],
    machineryUsed: [],
    materialUsed: [],
    status: "submitted",
  }),
});

const material = await requestJson("/api/materials", {
  method: "POST",
  body: JSON.stringify({
    projectId: "p-demo",
    name: `${marker}_MATERIAL`,
    category: "verify",
    spec: "report-spec",
    unit: "pcs",
    safetyStock: 3,
  }),
});

const summary = await requestJson("/api/reports/daily-log-summary");
if (!summary.keyWorks.some((item) => item.includes(marker))) {
  throw new Error("daily-log summary did not include persisted daily log marker");
}

const ledger = await requestJson("/api/reports/material-ledger");
if (!ledger.some((item) => item.materialName === material.name && item.spec === material.spec)) {
  throw new Error("material ledger did not include persisted material marker");
}

const dailyCsv = await requestText("/api/export/daily-log-summary");
if (!dailyCsv.includes(dailyLog.workPosition) || !dailyCsv.includes(dailyLog.workProcess)) {
  throw new Error("daily-log CSV did not include persisted daily log marker");
}

const materialCsv = await requestText("/api/export/material-ledger");
if (!materialCsv.includes(material.name) || !materialCsv.includes(material.spec)) {
  throw new Error("material CSV did not include persisted material marker");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      marker,
      dailyLogId: dailyLog.id,
      materialId: material.id,
      summaryLogCount: summary.logCount,
      ledgerCount: ledger.length,
    },
    null,
    2,
  ),
);

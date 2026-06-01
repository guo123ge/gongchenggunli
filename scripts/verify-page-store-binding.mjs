const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const marker = `PAGE_BIND_${Date.now()}`;
let cookie = "";

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

async function loginAsPm() {
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  cookie = csrfResponse.headers.getSetCookie().map((item) => item.split(";")[0]).join("; ");
  const csrf = await csrfResponse.json();
  const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      username: "pm",
      password: "123456",
      json: "true",
    }),
    redirect: "manual",
  });
  const nextCookies = loginResponse.headers.getSetCookie().map((item) => item.split(";")[0]);
  cookie = [cookie, ...nextCookies].filter(Boolean).join("; ");
  if (!cookie.includes("authjs.session-token") && !cookie.includes("__Secure-authjs.session-token")) {
    throw new Error("Login did not return a session cookie");
  }
}

async function pageHtml(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: "manual",
  });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.text();
}

function assertIncludes(html, expected, path) {
  if (!html.includes(expected)) throw new Error(`${path} did not include marker: ${expected}`);
}

await loginAsPm();

const material = await requestJson("/api/materials", {
  method: "POST",
  body: JSON.stringify({
    projectId: "p-demo",
    name: `${marker}_MATERIAL`,
    category: "verify",
    spec: "verify-spec",
    unit: "pcs",
    safetyStock: 1,
  }),
});

const stockIn = await requestJson("/api/materials/stock-in", {
  method: "POST",
  body: JSON.stringify({
    materialId: material.id,
    billNo: `${marker}_STOCK_IN`,
    quantity: 1,
  }),
});

const hazard = await requestJson("/api/safety/hazards", {
  method: "POST",
  body: JSON.stringify({
    title: `${marker}_HAZARD`,
    area: "Page verification area",
    riskLevel: "high",
    dueDate: "2026-06-03",
  }),
});

const machine = await requestJson("/api/machinery", {
  method: "POST",
  body: JSON.stringify({
    name: `${marker}_MACHINE`,
    code: `${marker}_MC`,
    operator: "Page verifier",
    nextMaintenanceDate: "2026-06-10",
  }),
});

const maintenance = await requestJson(`/api/machinery/${machine.id}/maintenance`, {
  method: "POST",
  body: JSON.stringify({
    content: `${marker}_MAINTENANCE`,
    cost: 321,
  }),
});

const shift = await requestJson(`/api/machinery/${machine.id}/shifts`, {
  method: "POST",
  body: JSON.stringify({
    workDate: "2026-06-01",
    shiftHours: 6,
    workContent: `${marker}_SHIFT`,
  }),
});

const archive = await requestJson("/api/archives", {
  method: "POST",
  body: JSON.stringify({
    title: `${marker}_ARCHIVE`,
    category: "verify",
    tags: ["page", "binding"],
  }),
});

const change = await requestJson("/api/changes", {
  method: "POST",
  body: JSON.stringify({
    title: `${marker}_CHANGE`,
    reason: "Page binding verification",
    content: "Verify persisted changes are visible on the page.",
    estimatedCost: 123,
  }),
});

const visa = await requestJson("/api/visas", {
  method: "POST",
  body: JSON.stringify({
    title: `${marker}_VISA`,
    visaType: "page-binding",
    totalAmount: 456,
  }),
});

const checks = [
  ["/dashboard", hazard.title],
  ["/dashboard", machine.name],
  ["/material", material.name],
  ["/material/stock-in", stockIn.billNo],
  ["/review", material.name],
  ["/safety", hazard.title],
  [`/safety/hazards/${hazard.id}`, hazard.title],
  ["/machinery", machine.name],
  [`/machinery/${machine.id}`, machine.name],
  [`/machinery/${machine.id}`, maintenance.content],
  [`/machinery/${machine.id}`, shift.workContent],
  ["/archive", archive.title],
  ["/change-visa", change.title],
  ["/change-visa", visa.title],
];

for (const [path, expected] of checks) {
  const html = await pageHtml(path);
  assertIncludes(html, expected, path);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      marker,
      materialId: material.id,
      stockInId: stockIn.id,
      hazardId: hazard.id,
      machineId: machine.id,
      maintenanceId: maintenance.id,
      shiftId: shift.id,
      archiveId: archive.id,
      changeId: change.id,
      visaId: visa.id,
      checkedPages: [...new Set(checks.map(([path]) => path))],
    },
    null,
    2,
  ),
);

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
let cookie = "";

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  }
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
    throw new Error("登录未获得 session cookie");
  }
}

await loginAsPm();

const createdLog = await request("/api/daily-logs", {
  method: "POST",
  body: JSON.stringify({
    projectId: "p-demo",
    workDate: "2026-06-01",
    weather: "晴",
    tempLow: 22,
    tempHigh: 31,
    workContent: "自动化验证：完成地下室样板段施工记录。",
    workPosition: "地下室样板段",
    workProcess: "自动化验证",
    laborCount: 8,
    laborDetail: [{ type: "普工", count: 8 }],
    machineryUsed: ["塔吊 1#"],
    materialUsed: [{ name: "HRB400E 钢筋", quantity: 1, unit: "吨" }],
    status: "submitted",
  }),
});

await request("/api/review", {
  method: "POST",
  body: JSON.stringify({
    targetType: "daily-log",
    targetId: createdLog.id,
    action: "approve",
    comment: "自动化验证通过",
  }),
});

const materialsBefore = await request("/api/materials");
const steelBefore = materialsBefore.find((item) => item.id === "mat-001");

const stockIn = await request("/api/materials/stock-in", {
  method: "POST",
  body: JSON.stringify({
    materialId: "mat-001",
    billNo: `RK-VERIFY-${Date.now()}`,
    quantity: 2,
    supplier: "自动化供应商",
  }),
});

await request("/api/review", {
  method: "POST",
  body: JSON.stringify({
    targetType: "material",
    targetId: stockIn.id,
    action: "approve",
    comment: "自动化验证入库通过",
  }),
});

const materialsAfter = await request("/api/materials");
const steelAfter = materialsAfter.find((item) => item.id === "mat-001");

if (!steelBefore || !steelAfter || steelAfter.currentStock !== steelBefore.currentStock + 2) {
  throw new Error(`库存联动失败：before=${steelBefore?.currentStock}, after=${steelAfter?.currentStock}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      createdLogId: createdLog.id,
      stockInId: stockIn.id,
      steelBefore: steelBefore.currentStock,
      steelAfter: steelAfter.currentStock,
    },
    null,
    2,
  ),
);

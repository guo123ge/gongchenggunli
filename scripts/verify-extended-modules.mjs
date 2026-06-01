const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

const hazard = await request("/api/safety/hazards", {
  method: "POST",
  body: JSON.stringify({
    title: "自动化验证隐患",
    area: "验证区",
    riskLevel: "high",
    dueDate: "2026-06-03",
  }),
});
const updatedHazard = await request(`/api/safety/hazards/${hazard.id}`, {
  method: "PATCH",
  body: JSON.stringify({ status: "reviewing" }),
});

const machine = await request("/api/machinery", {
  method: "POST",
  body: JSON.stringify({
    name: "自动化验证机械",
    code: `MC-VERIFY-${Date.now()}`,
    operator: "验证员",
    nextMaintenanceDate: "2026-06-10",
  }),
});

const archive = await request("/api/archives", {
  method: "POST",
  body: JSON.stringify({
    title: "自动化验证档案",
    category: "验证",
    tags: ["自动化", "档案"],
  }),
});

const change = await request("/api/changes", {
  method: "POST",
  body: JSON.stringify({
    title: "自动化验证变更",
    reason: "验证持久化",
    content: "验证变更内容",
    estimatedCost: 1200,
  }),
});

const visa = await request("/api/visas", {
  method: "POST",
  body: JSON.stringify({
    title: "自动化验证签证",
    visaType: "standard",
    totalAmount: 800,
  }),
});

const [hazards, machines, archives, changes, visas] = await Promise.all([
  request("/api/safety/hazards"),
  request("/api/machinery"),
  request("/api/archives"),
  request("/api/changes"),
  request("/api/visas"),
]);

for (const [name, list, item] of [
  ["hazard", hazards, updatedHazard],
  ["machine", machines, machine],
  ["archive", archives, archive],
  ["change", changes, change],
  ["visa", visas, visa],
]) {
  if (!list.some((row) => row.id === item.id)) throw new Error(`${name} was not persisted`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      hazardId: hazard.id,
      hazardStatus: updatedHazard.status,
      machineId: machine.id,
      archiveId: archive.id,
      changeId: change.id,
      visaId: visa.id,
    },
    null,
    2,
  ),
);


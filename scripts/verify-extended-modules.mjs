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

const incident = await request("/api/safety/incidents", {
  method: "POST",
  body: JSON.stringify({
    title: "verify safety incident",
    incidentDate: "2026-06-01",
    level: "high",
    description: "incident persistence verification",
  }),
});
const updatedIncident = await request(`/api/safety/incidents/${incident.id}`, {
  method: "PATCH",
  body: JSON.stringify({ status: "closed", reviewComment: "verified" }),
});
const incidentDetail = await request(`/api/safety/incidents/${incident.id}`);

const machine = await request("/api/machinery", {
  method: "POST",
  body: JSON.stringify({
    name: "自动化验证机械",
    code: `MC-VERIFY-${Date.now()}`,
    operator: "验证员",
    nextMaintenanceDate: "2026-06-10",
  }),
});

const maintenance = await request(`/api/machinery/${machine.id}/maintenance`, {
  method: "POST",
  body: JSON.stringify({
    content: "verify maintenance record",
    cost: 345,
  }),
});

const shift = await request(`/api/machinery/${machine.id}/shifts`, {
  method: "POST",
  body: JSON.stringify({
    workDate: "2026-06-01",
    shiftHours: 7.5,
    workContent: "verify shift record",
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
const [incidents, maintenanceRecords, shiftRecords] = await Promise.all([
  request("/api/safety/incidents"),
  request(`/api/machinery/${machine.id}/maintenance`),
  request(`/api/machinery/${machine.id}/shifts`),
]);

for (const [name, list, item] of [
  ["hazard", hazards, updatedHazard],
  ["incident", incidents, updatedIncident],
  ["machine", machines, machine],
  ["maintenance", maintenanceRecords, maintenance],
  ["shift", shiftRecords, shift],
  ["archive", archives, archive],
  ["change", changes, change],
  ["visa", visas, visa],
]) {
  if (!list.some((row) => row.id === item.id)) throw new Error(`${name} was not persisted`);
}
if (incidentDetail.id !== incident.id || incidentDetail.status !== "closed") throw new Error("incident detail was not updated");

console.log(
  JSON.stringify(
    {
      ok: true,
      hazardId: hazard.id,
      hazardStatus: updatedHazard.status,
      incidentId: incident.id,
      incidentStatus: updatedIncident.status,
      machineId: machine.id,
      maintenanceId: maintenance.id,
      shiftId: shift.id,
      archiveId: archive.id,
      changeId: change.id,
      visaId: visa.id,
    },
    null,
    2,
  ),
);

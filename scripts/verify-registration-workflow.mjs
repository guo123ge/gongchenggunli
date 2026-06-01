const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const marker = `REG_BIND_${Date.now()}`;

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

const registration = await requestJson("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({
    displayName: `${marker}_USER`,
    phone: "13900000001",
    username: `${marker}_username`,
  }),
});

if (registration.status !== "pending" || registration.username !== `${marker}_username`) {
  throw new Error(`registration response was not a pending request: ${JSON.stringify(registration)}`);
}

const dashboard = await requestJson("/api/dashboard");
if (!dashboard.summary || !Array.isArray(dashboard.materials)) {
  throw new Error("dashboard read failed after registration store write");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      marker,
      registrationId: registration.id,
      status: registration.status,
    },
    null,
    2,
  ),
);

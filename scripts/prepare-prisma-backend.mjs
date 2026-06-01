import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import net from "node:net";
import { resolve } from "node:path";

const steps = [
  ["npx.cmd", ["prisma", "generate"]],
  ["npx.cmd", ["prisma", "migrate", "deploy"]],
  ["npm.cmd", ["run", "db:seed"]],
  ["npm.cmd", ["run", "verify:prisma"]],
];

loadEnvFiles();
await assertPostgresReachable();

for (const [command, args] of steps) {
  const label = `${command} ${args.join(" ")}`;
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function loadEnvFiles() {
  for (const envFile of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(process.cwd(), envFile), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
        if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
      }
    } catch {
      // Optional env files.
    }
  }
}

async function assertPostgresReachable() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    printUnavailable("DATABASE_URL is not configured.");
  }

  const url = new URL(databaseUrl);
  const host = url.hostname || "localhost";
  const port = Number(url.port || 5432);
  const reachable = await canConnect(host, port, 1500);
  if (!reachable) {
    printUnavailable(`PostgreSQL is not reachable at ${host}:${port}.`);
  }
}

function canConnect(host, port, timeoutMs) {
  return new Promise((resolveConnect) => {
    const socket = net.createConnection({ host, port });
    const finish = (result) => {
      socket.destroy();
      resolveConnect(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function printUnavailable(message) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        code: "POSTGRES_UNAVAILABLE",
        message,
        databaseUrl: process.env.DATABASE_URL,
        nextSteps: [
          "Start PostgreSQL, for example: docker compose up -d postgres",
          "Run this command again: npm.cmd run db:prepare",
          "Then switch .env.local to DATA_BACKEND=\"prisma\" when you want the app to use PostgreSQL.",
        ],
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  const [projectCount, userCount, materialCount, dailyLogCount, reviewCount] = await Promise.all([
    prisma.project.count(),
    prisma.user.count(),
    prisma.material.count(),
    prisma.dailyLog.count(),
    Promise.all([
      prisma.dailyLog.count({ where: { status: "submitted" } }),
      prisma.stockIn.count({ where: { status: "submitted" } }),
      prisma.stockOut.count({ where: { status: "submitted" } }),
    ]).then((counts) => counts.reduce((sum, item) => sum + item, 0)),
  ]);

  if (projectCount < 1 || userCount < 7 || materialCount < 3) {
    throw new Error(
      `seed data incomplete: projects=${projectCount}, users=${userCount}, materials=${materialCount}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectCount,
        userCount,
        materialCount,
        dailyLogCount,
        pendingReviewCount: reviewCount,
      },
      null,
      2,
    ),
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  const isConnectionError = code === "P1001" || message.includes("Can't reach database server");

  if (isConnectionError) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          code: "POSTGRES_UNAVAILABLE",
          message: "PostgreSQL is not reachable at the configured DATABASE_URL.",
          databaseUrl: process.env.DATABASE_URL,
          nextSteps: [
            "Start PostgreSQL, for example: docker compose up -d postgres",
            "Run: npm.cmd run db:prepare",
            "Then switch .env.local to DATA_BACKEND=\"prisma\" when you want the app to use PostgreSQL.",
          ],
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await prisma.$disconnect();
}

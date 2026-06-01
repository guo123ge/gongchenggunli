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
} finally {
  await prisma.$disconnect();
}

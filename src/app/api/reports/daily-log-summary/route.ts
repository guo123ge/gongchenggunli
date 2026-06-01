import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readAppData();
  const totalLabor = data.dailyLogs.reduce((sum, item) => sum + item.laborCount, 0);
  return NextResponse.json({
    ok: true,
    data: {
      period: "2026-W22",
      logCount: data.dailyLogs.length,
      totalLabor,
      keyWorks: data.dailyLogs.map((item) => item.workContent),
      statusCounts: data.dailyLogs.reduce<Record<string, number>>((counts, item) => {
        counts[item.status] = (counts[item.status] ?? 0) + 1;
        return counts;
      }, {}),
    },
  });
}

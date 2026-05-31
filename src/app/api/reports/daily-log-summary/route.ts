import { NextResponse } from "next/server";
import { dailyLogs } from "@/lib/mock-data";

export async function GET() {
  const totalLabor = dailyLogs.reduce((sum, item) => sum + item.laborCount, 0);
  return NextResponse.json({
    ok: true,
    data: {
      period: "2026-W22",
      logCount: dailyLogs.length,
      totalLabor,
      keyWorks: dailyLogs.map((item) => item.workContent),
    },
  });
}


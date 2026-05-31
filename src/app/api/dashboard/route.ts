import { NextResponse } from "next/server";
import { dailyLogs, dashboardSummary, hazards, machinery, materials, reviewItems } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      summary: dashboardSummary,
      recentLogs: dailyLogs,
      pendingReviews: reviewItems,
      materials,
      hazards,
      machinery,
    },
  });
}


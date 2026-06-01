import { NextResponse } from "next/server";
import { calculateDashboardSummary, readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({
    ok: true,
    data: {
      summary: calculateDashboardSummary(data),
      recentLogs: data.dailyLogs,
      pendingReviews: data.reviewItems,
      materials: data.materials,
      hazards: data.hazards,
      machinery: data.machinery,
    },
  });
}

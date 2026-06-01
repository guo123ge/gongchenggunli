import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";

type Notice = {
  id: string;
  title: string;
  type: "review" | "stock" | "safety" | "maintenance";
  read: boolean;
};

export async function GET() {
  const data = await readAppData();
  const notices: Notice[] = [];

  const pendingReviews = data.reviewItems.filter((item) => item.status === "submitted");
  if (pendingReviews.length > 0) {
    notices.push({
      id: "review-pending",
      title: `${pendingReviews.length} records are waiting for review`,
      type: "review",
      read: false,
    });
  }

  for (const item of data.materials.filter((material) => material.currentStock < material.safetyStock).slice(0, 5)) {
    notices.push({
      id: `stock-${item.id}`,
      title: `${item.name} is below safety stock`,
      type: "stock",
      read: false,
    });
  }

  for (const item of data.hazards.filter((hazard) => hazard.status !== "closed").slice(0, 5)) {
    notices.push({
      id: `safety-${item.id}`,
      title: `${item.title} is still open`,
      type: "safety",
      read: false,
    });
  }

  for (const item of data.machinery.filter((machine) => machine.nextMaintenanceDate && machine.nextMaintenanceDate <= "2026-06-05").slice(0, 5)) {
    notices.push({
      id: `maintenance-${item.id}`,
      title: `${item.name} maintenance is due by ${item.nextMaintenanceDate}`,
      type: "maintenance",
      read: false,
    });
  }

  return NextResponse.json({ ok: true, data: notices });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      read: false,
      ...body,
    },
  });
}

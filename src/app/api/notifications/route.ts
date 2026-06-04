import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";

type Notice = {
  id: string;
  title: string;
  type: "review" | "stock" | "safety" | "maintenance";
  read: boolean;
  href: string;
};

export async function GET() {
  const data = await readAppData();
  const notices: Notice[] = [];

  const pendingReviews = data.reviewItems.filter((item) => item.status === "submitted");
  if (pendingReviews.length > 0) {
    notices.push({
      id: "review-pending",
      title: `当前有 ${pendingReviews.length} 条记录待审核`,
      type: "review",
      read: false,
      href: "/review",
    });
  }

  for (const item of data.materials.filter((material) => material.currentStock < material.safetyStock).slice(0, 5)) {
    notices.push({
      id: `stock-${item.id}`,
      title: `${item.name} 已低于安全库存`,
      type: "stock",
      read: false,
      href: "/material",
    });
  }

  for (const item of data.hazards.filter((hazard) => hazard.status !== "closed").slice(0, 5)) {
    notices.push({
      id: `safety-${item.id}`,
      title: `${item.title} 仍未闭环`,
      type: "safety",
      read: false,
      href: `/safety/hazards/${item.id}`,
    });
  }

  for (const item of data.machinery.filter((machine) => machine.nextMaintenanceDate && machine.nextMaintenanceDate <= "2026-06-05").slice(0, 5)) {
    notices.push({
      id: `maintenance-${item.id}`,
      title: `${item.name} 保养到期日：${item.nextMaintenanceDate}`,
      type: "maintenance",
      read: false,
      href: `/machinery/${item.id}`,
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
      href: "/dashboard",
      ...body,
    },
  });
}

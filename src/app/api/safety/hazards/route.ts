import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaHazard, getPrismaHazards } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { Hazard } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaHazards() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.hazards });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaHazard(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const item: Hazard = {
      id: crypto.randomUUID(),
      title: String(body.title ?? "未命名隐患"),
      area: String(body.area ?? "未指定区域"),
      riskLevel: body.riskLevel ?? "medium",
      status: body.status ?? "open",
      owner: String(body.owner ?? "陈安全"),
      dueDate: String(body.dueDate ?? new Date().toISOString().slice(0, 10)),
    };
    data.hazards.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

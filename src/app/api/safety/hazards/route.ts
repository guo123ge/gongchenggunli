import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaHazard, getPrismaHazards } from "@/lib/prisma-repository";
import { updateStore } from "@/lib/server-store";
import type { Hazard } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaHazards() });
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.hazards.filter((item) => !hasDirtyText(item.title, item.area, item.owner)) });
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
      projectId: data.project.id,
      title: cleanText(body.title, "未命名隐患"),
      area: cleanText(body.area, "未指定区域"),
      riskLevel: body.riskLevel ?? "medium",
      status: body.status ?? "open",
      owner: cleanText(body.owner, "安全员"),
      dueDate: cleanText(body.dueDate, new Date().toISOString().slice(0, 10)),
    };
    data.hazards.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

function cleanText(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  if (!text || text.includes("???")) return fallback;
  return text;
}

function hasDirtyText(...values: string[]) {
  return values.some((value) => value.includes("???"));
}

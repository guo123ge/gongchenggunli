import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { updatePrismaIncident } from "@/lib/prisma-repository";
import { updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.incidents.find((incident) => incident.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "安全事件不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const updated = await updatePrismaIncident(id, body);
    if (!updated) return NextResponse.json({ ok: false, error: "安全事件不存在" }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  }

  const updated = await updateStore((data) => {
    const index = data.incidents.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.incidents[index] = { ...data.incidents[index], ...body };
    return data.incidents[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "安全事件不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

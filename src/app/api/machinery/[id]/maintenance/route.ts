import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaMaintenanceRecord, getPrismaMaintenanceRecords } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { MaintenanceRecord } from "@/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaMaintenanceRecords(id) });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.maintenanceRecords.filter((item) => item.machineryId === id) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    try {
      const created = await createPrismaMaintenanceRecord(id, body);
      return NextResponse.json({ ok: true, data: created });
    } catch {
      return NextResponse.json({ ok: false, error: "Machinery does not exist" }, { status: 404 });
    }
  }

  const created = await updateStore((data) => {
    if (!data.machinery.some((item) => item.id === id)) return null;
    const item: MaintenanceRecord = {
      id: crypto.randomUUID(),
      machineryId: id,
      content: String(body.content ?? "Maintenance record"),
      cost: Number(body.cost ?? 0),
      handledBy: String(body.handledBy ?? "Machinery Lead"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.maintenanceRecords.unshift(item);
    return item;
  });
  if (!created) return NextResponse.json({ ok: false, error: "Machinery does not exist" }, { status: 404 });
  return NextResponse.json({ ok: true, data: created });
}

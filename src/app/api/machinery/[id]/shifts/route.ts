import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaShiftRecord, getPrismaShiftRecords } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { ShiftRecord } from "@/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaShiftRecords(id) });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.shiftRecords.filter((item) => item.machineryId === id) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    try {
      const created = await createPrismaShiftRecord(id, body);
      return NextResponse.json({ ok: true, data: created });
    } catch {
      return NextResponse.json({ ok: false, error: "Machinery does not exist" }, { status: 404 });
    }
  }

  const created = await updateStore((data) => {
    const machine = data.machinery.find((item) => item.id === id);
    if (!machine) return null;
    const item: ShiftRecord = {
      id: crypto.randomUUID(),
      machineryId: id,
      workDate: String(body.workDate ?? new Date().toISOString().slice(0, 10)),
      shiftHours: Number(body.shiftHours ?? 0),
      workContent: String(body.workContent ?? "Shift work"),
      submittedBy: String(body.submittedBy ?? "Machinery Lead"),
    };
    data.shiftRecords.unshift(item);
    machine.shiftsThisMonth += 1;
    return item;
  });
  if (!created) return NextResponse.json({ ok: false, error: "Machinery does not exist" }, { status: 404 });
  return NextResponse.json({ ok: true, data: created });
}

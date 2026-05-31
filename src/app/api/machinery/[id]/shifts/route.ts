import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: [{ id: "sf-001", machineryId: (await params).id, shiftHours: 8, workContent: "材料吊运" }] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), machineryId: (await params).id, ...(await request.json().catch(() => ({}))) } });
}


import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: [{ id: "mt-001", machineryId: (await params).id, content: "月度保养", cost: 1200 }] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), machineryId: (await params).id, ...(await request.json().catch(() => ({}))) } });
}


import { NextResponse } from "next/server";
import { hazards } from "@/lib/mock-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = hazards.find((hazard) => hazard.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "隐患不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}


import { NextResponse } from "next/server";
import { machinery } from "@/lib/mock-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = machinery.find((machine) => machine.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "机械不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, deleted: true } });
}


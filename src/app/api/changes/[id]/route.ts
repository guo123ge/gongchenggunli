import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, title: "地下室集水坑位置调整", estimatedCost: 18600, status: "submitted" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, deleted: true } });
}


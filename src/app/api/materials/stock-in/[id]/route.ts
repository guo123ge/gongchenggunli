import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, deleted: true } });
}


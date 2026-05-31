import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, title: "夜间抢工增加照明台班", totalAmount: 5760, status: "draft" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, deleted: true } });
}


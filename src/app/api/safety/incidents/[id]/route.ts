import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, title: "安全事件详情", status: "submitted" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}


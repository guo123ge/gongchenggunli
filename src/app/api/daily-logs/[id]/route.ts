import { NextResponse } from "next/server";
import { findDailyLog } from "@/lib/mock-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = findDailyLog(id);
  if (!log) return NextResponse.json({ ok: false, error: "日志不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: log });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, data: { id, ...body, updatedAt: new Date().toISOString() } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}


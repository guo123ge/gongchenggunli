import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readStore();
  const log = data.dailyLogs.find((item) => item.id === id);
  if (!log) return NextResponse.json({ ok: false, error: "日志不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: log });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateStore((data) => {
    const index = data.dailyLogs.findIndex((item) => item.id === id);
    if (index === -1) return null;
    if (data.dailyLogs[index].status === "approved") return data.dailyLogs[index];
    data.dailyLogs[index] = { ...data.dailyLogs[index], ...body };
    return data.dailyLogs[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "日志不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateStore((data) => {
    data.dailyLogs = data.dailyLogs.filter((item) => !(item.id === id && item.status === "draft"));
  });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

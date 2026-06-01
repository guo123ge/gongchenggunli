import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { deletePrismaChange, updatePrismaChange } from "@/lib/prisma-repository";
import { updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.changes.find((change) => change.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "设计变更不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const updated = await updatePrismaChange(id, body);
    if (!updated) return NextResponse.json({ ok: false, error: "Change does not exist" }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  }
  const updated = await updateStore((data) => {
    const index = data.changes.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.changes[index] = { ...data.changes[index], ...body };
    return data.changes[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "设计变更不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isPrismaBackendEnabled()) {
    await deletePrismaChange(id);
    return NextResponse.json({ ok: true, data: { id, deleted: true } });
  }
  await updateStore((data) => {
    data.changes = data.changes.filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

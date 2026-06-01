import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.machinery.find((machine) => machine.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "机械不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateStore((data) => {
    const index = data.machinery.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.machinery[index] = { ...data.machinery[index], ...body };
    return data.machinery[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "机械不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateStore((data) => {
    data.machinery = data.machinery.filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

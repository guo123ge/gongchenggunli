import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.visas.find((visa) => visa.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "工程签证不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateStore((data) => {
    const index = data.visas.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.visas[index] = { ...data.visas[index], ...body };
    return data.visas[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "工程签证不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateStore((data) => {
    data.visas = data.visas.filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

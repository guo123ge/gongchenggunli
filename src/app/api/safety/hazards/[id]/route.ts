import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readStore();
  const item = data.hazards.find((hazard) => hazard.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "隐患不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateStore((data) => {
    const index = data.hazards.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.hazards[index] = { ...data.hazards[index], ...body };
    return data.hazards[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "隐患不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}


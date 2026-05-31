import { NextResponse } from "next/server";
import { findMaterial } from "@/lib/mock-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = findMaterial(id);
  if (!material) return NextResponse.json({ ok: false, error: "材料不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: material });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ ok: true, data: { id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}


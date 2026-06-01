import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const archive = data.archives.find((item) => item.id === id);
  if (!archive) return NextResponse.json({ ok: false, error: "档案不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: archive });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateStore((data) => {
    const index = data.archives.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.archives[index] = { ...data.archives[index], ...body };
    return data.archives[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "档案不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateStore((data) => {
    data.archives = data.archives.filter((item) => item.id !== id);
    data.archiveFiles = data.archiveFiles.filter((item) => item.archiveId !== id);
  });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

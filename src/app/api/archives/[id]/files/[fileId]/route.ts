import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const data = await readStore();
  const file = data.archiveFiles.find((item) => item.archiveId === id && item.id === fileId);
  if (!file) return NextResponse.json({ ok: false, error: "档案文件不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, data: file });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  await updateStore((data) => {
    data.archiveFiles = data.archiveFiles.filter((item) => !(item.archiveId === id && item.id === fileId));
  });
  return NextResponse.json({ ok: true, data: { id: fileId, deleted: true } });
}


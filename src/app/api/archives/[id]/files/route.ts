import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readStore();
  return NextResponse.json({
    ok: true,
    data: data.archiveFiles.filter((file) => file.archiveId === id),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const created = await updateStore((data) => {
    const existingVersions = data.archiveFiles.filter((file) => file.archiveId === id).length;
    const file = {
      id: crypto.randomUUID(),
      archiveId: id,
      fileName: String(body.fileName ?? "未命名文件"),
      filePath: String(body.filePath ?? ""),
      fileType: String(body.fileType ?? "application/octet-stream"),
      fileSize: Number(body.fileSize ?? 0),
      version: String(body.version ?? `v1.${existingVersions}`),
      url: String(body.url ?? ""),
      uploadedAt: new Date().toLocaleString("zh-CN"),
    };
    data.archiveFiles.unshift(file);
    return file;
  });

  return NextResponse.json({ ok: true, data: created });
}


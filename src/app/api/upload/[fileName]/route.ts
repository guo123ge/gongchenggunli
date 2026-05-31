import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  const uploadDir = path.resolve(process.cwd(), "uploads");
  const filePath = path.resolve(uploadDir, fileName);

  if (!filePath.startsWith(uploadDir + path.sep)) {
    return NextResponse.json({ ok: false, error: "非法文件路径" }, { status: 400 });
  }

  try {
    const info = await stat(filePath);
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    const ext = path.extname(fileName).toLowerCase();
    return new Response(stream, {
      headers: {
        "Content-Type": contentTypes[ext] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "文件不存在" }, { status: 404 });
  }
}


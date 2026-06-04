import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
  const safeName = path.basename(decodeURIComponent(fileName));
  const filePath = path.join(uploadDir, safeName);

  if (!filePath.startsWith(uploadDir)) {
    return NextResponse.json({ ok: false, error: "文件路径无效。" }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": getContentType(safeName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "文件不存在或已被删除。" }, { status: 404 });
  }
}

function getContentType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/octet-stream";
}

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "未找到上传文件" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeOriginalName = file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
  const fileName = `${Date.now()}-${safeOriginalName}`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, bytes);

  return NextResponse.json({
    ok: true,
    data: {
      fileName: file.name,
      filePath,
      fileType: file.type,
      fileSize: file.size,
      url: `/api/upload/${fileName}`,
    },
  });
}

import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaArchive, getPrismaArchives } from "@/lib/prisma-repository";
import { addReviewItem, updateStore } from "@/lib/server-store";
import type { ArchiveRecord } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaArchives() });
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.archives });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaArchive(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const item: ArchiveRecord = {
      id: crypto.randomUUID(),
      projectId: data.project.id,
      title: String(body.title ?? "未命名档案"),
      category: String(body.category ?? "其他"),
      tags: Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(",").filter(Boolean),
      version: String(body.version ?? "v1.0"),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "资料员"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.archives.unshift(item);
    if (item.status === "submitted") {
      addReviewItem(data, {
        id: item.id,
        targetType: "archive",
        title: `档案待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.createdAt,
        status: "submitted",
        priority: "normal",
      });
    }
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

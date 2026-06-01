import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";
import type { ArchiveRecord } from "@/types";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.archives });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const created = await updateStore((data) => {
    const item: ArchiveRecord = {
      id: crypto.randomUUID(),
      title: String(body.title ?? "未命名档案"),
      category: String(body.category ?? "其他"),
      tags: Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(",").filter(Boolean),
      version: String(body.version ?? "v1.0"),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "宋资料"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.archives.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}


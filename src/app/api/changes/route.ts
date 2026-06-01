import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { getPrismaChanges } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { ChangeRecord } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaChanges() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.changes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const created = await updateStore((data) => {
    const item: ChangeRecord = {
      id: crypto.randomUUID(),
      title: String(body.title ?? "未命名变更"),
      reason: String(body.reason ?? "待补充"),
      content: String(body.content ?? ""),
      estimatedCost: Number(body.estimatedCost ?? body.amount ?? 0),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "吴技术"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.changes.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaChange, getPrismaChanges } from "@/lib/prisma-repository";
import { addReviewItem, updateStore } from "@/lib/server-store";
import type { ChangeRecord } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaChanges() });
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.changes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaChange(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const item: ChangeRecord = {
      id: crypto.randomUUID(),
      projectId: data.project.id,
      title: String(body.title ?? "未命名变更"),
      reason: String(body.reason ?? "待补充"),
      content: String(body.content ?? ""),
      estimatedCost: Number(body.estimatedCost ?? body.amount ?? 0),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "技术负责人"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.changes.unshift(item);
    if (item.status === "submitted") {
      addReviewItem(data, {
        id: item.id,
        targetType: "change-visa",
        title: `设计变更待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.createdAt,
        status: "submitted",
        priority: "urgent",
      });
    }
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

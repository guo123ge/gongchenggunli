import { NextResponse } from "next/server";
import { deriveQuantityStatus } from "@/lib/quantity-utils";
import { readStore, updateStore } from "@/lib/server-store";
import { quantitySchema } from "@/lib/validators";
import type { QuantityItem } from "@/types";

export async function GET() {
  const data = await readStore();
  const projectId = data.project.id;
  return NextResponse.json({ ok: true, data: data.quantities.filter((item) => item.projectId === projectId) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const data = await readStore();
  const parsed = quantitySchema.safeParse({ ...body, projectId: data.project.id });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "工程量校验失败", details: parsed.error.flatten() }, { status: 422 });
  if (parsed.data.completedQuantity > parsed.data.totalQuantity) {
    return NextResponse.json({ ok: false, error: "已完工程量不能大于全部数量。" }, { status: 422 });
  }

  const now = new Date().toISOString();
  const created = await updateStore((store) => {
    const item: QuantityItem = {
      id: crypto.randomUUID(),
      ...parsed.data,
      plannedFinishDate: parsed.data.plannedFinishDate || undefined,
      remark: parsed.data.remark || "",
      status: deriveQuantityStatus(parsed.data),
      createdAt: now,
      updatedAt: now,
    };
    store.quantities.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

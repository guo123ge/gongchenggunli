import { NextResponse } from "next/server";
import { deriveQuantityStatus } from "@/lib/quantity-utils";
import { readStore, updateStore } from "@/lib/server-store";
import { quantitySchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await readStore();
  const item = data.quantities.find((quantity) => quantity.id === params.id && quantity.projectId === data.project.id);
  if (!item) return NextResponse.json({ ok: false, error: "工程量不存在。" }, { status: 404 });
  return NextResponse.json({ ok: true, data: { item, updates: data.quantityUpdates.filter((update) => update.quantityId === params.id) } });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const store = await readStore();
  const parsed = quantitySchema.safeParse({ ...body, projectId: store.project.id });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "工程量校验失败", details: parsed.error.flatten() }, { status: 422 });
  if (parsed.data.completedQuantity > parsed.data.totalQuantity) {
    return NextResponse.json({ ok: false, error: "已完工程量不能大于全部数量。" }, { status: 422 });
  }

  const updated = await updateStore((data) => {
    const index = data.quantities.findIndex((item) => item.id === params.id && item.projectId === data.project.id);
    if (index === -1) return null;
    data.quantities[index] = {
      ...data.quantities[index],
      ...parsed.data,
      plannedFinishDate: parsed.data.plannedFinishDate || undefined,
      remark: parsed.data.remark || "",
      status: deriveQuantityStatus(parsed.data),
      updatedAt: new Date().toISOString(),
    };
    return data.quantities[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "工程量不存在。" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = await updateStore((data) => {
    const index = data.quantities.findIndex((item) => item.id === params.id && item.projectId === data.project.id);
    if (index === -1) return false;
    data.quantities.splice(index, 1);
    data.quantityUpdates = data.quantityUpdates.filter((update) => update.quantityId !== params.id);
    return true;
  });
  if (!deleted) return NextResponse.json({ ok: false, error: "工程量不存在。" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

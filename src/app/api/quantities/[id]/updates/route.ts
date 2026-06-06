import { NextResponse } from "next/server";
import { deriveQuantityStatus } from "@/lib/quantity-utils";
import { updateStore } from "@/lib/server-store";
import { quantityUpdateSchema } from "@/lib/validators";
import type { QuantityUpdate } from "@/types";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const parsed = quantityUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "工程量更新校验失败", details: parsed.error.flatten() }, { status: 422 });

  const result = await updateStore((data) => {
    const quantity = data.quantities.find((item) => item.id === params.id && item.projectId === data.project.id);
    if (!quantity) return { error: "工程量不存在。" };
    const nextCompleted = quantity.completedQuantity + parsed.data.completedAmount;
    if (nextCompleted > quantity.totalQuantity) return { error: "累计已完工程量不能大于全部数量。" };

    const update: QuantityUpdate = {
      id: crypto.randomUUID(),
      quantityId: quantity.id,
      projectId: quantity.projectId,
      ...parsed.data,
      delayReason: parsed.data.delayReason || "",
    };
    data.quantityUpdates.unshift(update);
    quantity.completedQuantity = nextCompleted;
    quantity.status = deriveQuantityStatus(quantity);
    quantity.updatedAt = new Date().toISOString();
    return { update, quantity };
  });

  if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  return NextResponse.json({ ok: true, data: result });
}

import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaStockOut, getPrismaStockOuts } from "@/lib/prisma-repository";
import { addReviewItem, readStore, updateStore } from "@/lib/server-store";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaStockOuts() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.stockOuts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    try {
      const created = await createPrismaStockOut(body);
      return NextResponse.json({ ok: true, data: created });
    } catch (error) {
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "出库提交失败" }, { status: 409 });
    }
  }
  const data = await readStore();
  const material = data.materials.find((item) => item.id === body.materialId);
  if (material && Number(body.quantity ?? 0) > material.currentStock) {
    return NextResponse.json({ ok: false, error: "库存不足，无法提交出库" }, { status: 409 });
  }
  const created = await updateStore((store) => {
    const currentMaterial = store.materials.find((item) => item.id === body.materialId);
    const item = {
      id: crypto.randomUUID(),
      materialId: String(body.materialId ?? ""),
      materialName: currentMaterial?.name ?? "未知材料",
      billNo: String(body.billNo ?? `CK-${Date.now()}`),
      quantity: Number(body.quantity ?? 0),
      status: "submitted",
      submittedBy: "当前用户",
      createdAt: new Date().toLocaleString("zh-CN"),
      receiver: String(body.receiver ?? "待补充"),
    } as const;
    store.stockOuts.unshift(item);
    addReviewItem(store, {
      id: item.id,
      targetType: "material",
      title: `${item.materialName}出库 ${item.quantity}`,
      submittedBy: item.submittedBy,
      submittedAt: item.createdAt,
      status: "submitted",
      priority: "normal",
    });
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

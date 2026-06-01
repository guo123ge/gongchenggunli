import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaStockIn, getPrismaStockIns } from "@/lib/prisma-repository";
import { addReviewItem, readStore, updateStore } from "@/lib/server-store";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaStockIns() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.stockIns });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaStockIn(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const material = data.materials.find((item) => item.id === body.materialId);
    const item = {
      id: crypto.randomUUID(),
      materialId: String(body.materialId ?? ""),
      materialName: material?.name ?? "未知材料",
      billNo: String(body.billNo ?? `RK-${Date.now()}`),
      quantity: Number(body.quantity ?? 0),
      status: "submitted",
      submittedBy: "当前用户",
      createdAt: new Date().toLocaleString("zh-CN"),
      supplier: String(body.supplier ?? "待补充"),
    } as const;
    data.stockIns.unshift(item);
    addReviewItem(data, {
      id: item.id,
      targetType: "material",
      title: `${item.materialName}入库 ${item.quantity}`,
      submittedBy: item.submittedBy,
      submittedAt: item.createdAt,
      status: "submitted",
      priority: "normal",
    });
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

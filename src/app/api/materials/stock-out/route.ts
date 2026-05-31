import { NextResponse } from "next/server";
import { materials, stockOuts } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, data: stockOuts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const material = materials.find((item) => item.id === body.materialId);
  if (material && Number(body.quantity ?? 0) > material.currentStock) {
    return NextResponse.json({ ok: false, error: "库存不足，无法提交出库" }, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      ...body,
      status: "submitted",
      message: "出库单已提交，审核通过后扣减库存",
    },
  });
}


import { NextResponse } from "next/server";
import { readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({
    ok: true,
    data: data.materials.map((item) => ({
      materialName: item.name,
      spec: item.spec,
      openingStock: item.currentStock + item.monthlyOut - item.monthlyIn,
      inQty: item.monthlyIn,
      outQty: item.monthlyOut,
      closingStock: item.currentStock,
      safetyStock: item.safetyStock,
      unit: item.unit,
    })),
  });
}

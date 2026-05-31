import { NextResponse } from "next/server";
import { materials } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: materials.map((item) => ({
      materialName: item.name,
      spec: item.spec,
      openingStock: item.currentStock + item.monthlyOut - item.monthlyIn,
      inQty: item.monthlyIn,
      outQty: item.monthlyOut,
      closingStock: item.currentStock,
    })),
  });
}


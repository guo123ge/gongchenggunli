import { NextResponse } from "next/server";
import { stockIns } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, data: stockIns });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      ...body,
      status: "submitted",
      message: "入库单已提交，审核通过后增加库存",
    },
  });
}


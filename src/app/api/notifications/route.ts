import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: [
      { id: "n1", title: "3 条记录等待审核", type: "review", read: false },
      { id: "n2", title: "HRB400E 钢筋低于安全库存", type: "stock", read: false },
      { id: "n3", title: "塔吊 1# 保养即将到期", type: "maintenance", read: false },
    ],
  });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))) } });
}


import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, data: [{ id: "chg-001", title: "地下室集水坑位置调整", estimatedCost: 18600, status: "submitted" }] });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "submitted" } });
}


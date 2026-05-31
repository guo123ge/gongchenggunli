import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, data: [{ id: "visa-001", title: "夜间抢工增加照明台班", totalAmount: 5760, status: "draft" }] });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "submitted" } });
}


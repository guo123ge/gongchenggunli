import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, data: [] });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "submitted" } });
}


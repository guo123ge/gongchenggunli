import { NextResponse } from "next/server";
import { machinery } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, data: machinery });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "onsite" } });
}


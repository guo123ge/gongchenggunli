import { NextResponse } from "next/server";
import { hazards } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, data: hazards });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "open" } });
}


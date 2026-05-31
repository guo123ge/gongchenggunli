import { NextResponse } from "next/server";
import { analyzeSafetyRisk } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, data: await analyzeSafetyRisk(String(body.image ?? "")) });
}


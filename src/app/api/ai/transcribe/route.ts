import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai";

export async function POST(request: Request) {
  const buffer = Buffer.from(await request.arrayBuffer());
  const result = await transcribeAudio(buffer, request.headers.get("content-type") ?? "");
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, reason: result.reason }, { status: 503 });
  }
  return NextResponse.json({ ok: true, data: { transcript: result.transcript, provider: result.provider } });
}

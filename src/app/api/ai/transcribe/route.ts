import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai";

export async function POST(request: Request) {
  const buffer = Buffer.from(await request.arrayBuffer());
  return NextResponse.json({ ok: true, data: { transcript: await transcribeAudio(buffer) } });
}


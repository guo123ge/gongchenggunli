import { NextResponse } from "next/server";
import { readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ ok: true, data: [data.project] });
}

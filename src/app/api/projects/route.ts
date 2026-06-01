import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: [data.project] });
}

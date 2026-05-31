import { NextResponse } from "next/server";
import { project } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, data: [project] });
}


import { NextResponse } from "next/server";
import { materials } from "@/lib/mock-data";
import { materialSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ ok: true, data: materials });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = materialSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "材料校验失败", details: parsed.error.flatten() }, { status: 422 });
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...parsed.data, currentStock: 0 } });
}


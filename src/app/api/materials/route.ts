import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";
import { materialSchema } from "@/lib/validators";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.materials });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = materialSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "材料校验失败", details: parsed.error.flatten() }, { status: 422 });
  const created = await updateStore((data) => {
    const item = { id: crypto.randomUUID(), ...parsed.data, currentStock: 0, monthlyIn: 0, monthlyOut: 0 };
    data.materials.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

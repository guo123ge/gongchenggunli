import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/server-store";
import type { Machinery } from "@/types";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.machinery });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const created = await updateStore((data) => {
    const item: Machinery = {
      id: crypto.randomUUID(),
      name: String(body.name ?? "未命名机械"),
      code: String(body.code ?? `MC-${Date.now()}`),
      operator: String(body.operator ?? "待分配"),
      status: body.status ?? "onsite",
      nextMaintenanceDate: String(body.nextMaintenanceDate ?? new Date().toISOString().slice(0, 10)),
      shiftsThisMonth: Number(body.shiftsThisMonth ?? 0),
    };
    data.machinery.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}


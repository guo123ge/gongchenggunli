import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { getPrismaVisas } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { VisaRecord } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaVisas() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.visas });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const created = await updateStore((data) => {
    const item: VisaRecord = {
      id: crypto.randomUUID(),
      title: String(body.title ?? "未命名签证"),
      visaType: String(body.visaType ?? "standard"),
      totalAmount: Number(body.totalAmount ?? body.amount ?? 0),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "吴技术"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.visas.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

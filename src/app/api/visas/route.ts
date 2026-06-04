import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaVisa, getPrismaVisas } from "@/lib/prisma-repository";
import { updateStore } from "@/lib/server-store";
import type { VisaRecord } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaVisas() });
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.visas });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaVisa(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const item: VisaRecord = {
      id: crypto.randomUUID(),
      projectId: data.project.id,
      title: String(body.title ?? "未命名签证"),
      visaType: String(body.visaType ?? "standard"),
      totalAmount: Number(body.totalAmount ?? body.amount ?? 0),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "技术负责人"),
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.visas.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

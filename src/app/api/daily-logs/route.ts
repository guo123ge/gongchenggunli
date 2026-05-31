import { NextResponse } from "next/server";
import { dailyLogs } from "@/lib/mock-data";
import { dailyLogSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const items = status ? dailyLogs.filter((item) => item.status === status) : dailyLogs;
  return NextResponse.json({ ok: true, data: { items, pagination: { page: 1, pageSize: 20, total: items.length } } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = dailyLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "施工日志校验失败", details: parsed.error.flatten() }, { status: 422 });
  }
  return NextResponse.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      ...parsed.data,
      status: parsed.data.status,
      submittedBy: "当前用户",
      attachments: [],
    },
  });
}


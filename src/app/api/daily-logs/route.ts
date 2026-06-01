import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { getPrismaDailyLogs } from "@/lib/prisma-repository";
import { addReviewItem, readStore, updateStore } from "@/lib/server-store";
import { dailyLogSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  if (isPrismaBackendEnabled()) {
    const logs = await getPrismaDailyLogs();
    const items = status ? logs.filter((item) => item.status === status) : logs;
    return NextResponse.json({ ok: true, data: { items, pagination: { page: 1, pageSize: 20, total: items.length } } });
  }
  const data = await readStore();
  const items = status ? data.dailyLogs.filter((item) => item.status === status) : data.dailyLogs;
  return NextResponse.json({ ok: true, data: { items, pagination: { page: 1, pageSize: 20, total: items.length } } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = dailyLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "施工日志校验失败", details: parsed.error.flatten() }, { status: 422 });
  }
  const created = await updateStore((data) => {
    const item = {
      id: crypto.randomUUID(),
      projectId: parsed.data.projectId,
      workDate: parsed.data.workDate.toISOString().slice(0, 10),
      weather: parsed.data.weather,
      tempLow: parsed.data.tempLow,
      tempHigh: parsed.data.tempHigh,
      workContent: parsed.data.workContent,
      workPosition: parsed.data.workPosition,
      workProcess: parsed.data.workProcess,
      laborCount: parsed.data.laborCount,
      laborDetail: parsed.data.laborDetail,
      machineryUsed: parsed.data.machineryUsed,
      materialUsed: parsed.data.materialUsed,
      qualityCheck: parsed.data.qualityCheck,
      safetyCheck: parsed.data.safetyCheck,
      status: parsed.data.status,
      submittedBy: "当前用户",
      attachments: [],
    };
    data.dailyLogs.unshift(item);
    if (item.status === "submitted") {
      addReviewItem(data, {
        id: item.id,
        targetType: "daily-log",
        title: `${item.workPosition}${item.workProcess}日志`,
        submittedBy: item.submittedBy,
        submittedAt: new Date().toLocaleString("zh-CN"),
        status: "submitted",
        priority: "normal",
      });
    }
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateStore } from "@/lib/server-store";
import type { ProjectRole } from "@/types/enums";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  const action = body.action === "download" ? "download" : "view";

  if (!id) {
    return NextResponse.json({ ok: false, error: "资料记录编号不能为空。" }, { status: 422 });
  }

  const updated = await updateStore((data) => {
    const record = data.documents.find((item) => item.id === id);
    if (!record) return null;
    record.accessLogs ??= [];
    record.accessLogs.unshift({
      id: crypto.randomUUID(),
      action,
      userName: session?.user?.name ?? "当前用户",
      userRole: ((session?.user?.role as ProjectRole | undefined) ?? "CON") as ProjectRole,
      createdAt: new Date().toLocaleString("zh-CN"),
    });
    return record;
  });

  if (!updated) return NextResponse.json({ ok: false, error: "未找到对应资料。" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
  const action = String(body.action ?? "");

  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "请至少选择一份资料。" }, { status: 422 });
  }

  if (action !== "archive") {
    return NextResponse.json({ ok: false, error: "暂不支持该批量操作。" }, { status: 422 });
  }

  const result = await updateStore((data) => {
    const idSet = new Set(ids);
    let updated = 0;
    const now = new Date().toLocaleString("zh-CN");
    const userName = session?.user?.name ?? "当前用户";

    data.documents = data.documents.map((item) => {
      if (!idSet.has(item.id)) return item;
      updated += 1;
      return {
        ...item,
        reviewStatus: "approved",
        archivedAt: now,
        archivedBy: userName,
      };
    });

    return { updated };
  });

  return NextResponse.json({ ok: true, data: result });
}

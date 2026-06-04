import { NextResponse } from "next/server";
import { updateStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  const summary = String(body.summary ?? "").trim();
  const status = body.aiReviewStatus === "passed" || body.aiReviewStatus === "warning" || body.aiReviewStatus === "failed" ? body.aiReviewStatus : "warning";

  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "请至少提供一条资料记录。" }, { status: 422 });
  }

  const updated = await updateStore((data) => {
    let count = 0;
    data.documents = data.documents.map((item) => {
      if (!ids.includes(item.id)) return item;
      count += 1;
      return {
        ...item,
        aiReviewStatus: status,
        aiSummary: summary || item.aiSummary || "AI 已完成资料审查。",
      };
    });
    return count;
  });

  return NextResponse.json({ ok: true, data: { updated } });
}

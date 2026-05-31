import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { closeReviewItem, readStore, updateStore } from "@/lib/server-store";
import { reviewSchema } from "@/lib/validators";

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.reviewItems });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "PM") {
    return NextResponse.json({ ok: false, error: "仅项目经理可以审核" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "审核参数无效", details: parsed.error.flatten() }, { status: 422 });
  }

  const result = await updateStore((data) => {
    const status = parsed.data.action === "approve" ? "approved" : "rejected";
    closeReviewItem(data, parsed.data.targetType, parsed.data.targetId, status);

    if (parsed.data.targetType === "daily-log") {
      const log = data.dailyLogs.find((item) => item.id === parsed.data.targetId);
      if (!log) return { error: "日志不存在" };
      log.status = status;
      log.reviewedBy = "周项目";
      log.reviewComment = parsed.data.comment ?? (status === "approved" ? "审核通过" : "审核未通过");
      return { target: log, status };
    }

    if (parsed.data.targetType === "material") {
      const stockIn = data.stockIns.find((item) => item.id === parsed.data.targetId);
      if (stockIn) {
        stockIn.status = status;
        if (status === "approved") {
          const material = data.materials.find((item) => item.id === stockIn.materialId);
          if (material) {
            material.currentStock += stockIn.quantity;
            material.monthlyIn += stockIn.quantity;
          }
        }
        return { target: stockIn, status };
      }

      const stockOut = data.stockOuts.find((item) => item.id === parsed.data.targetId);
      if (stockOut) {
        const material = data.materials.find((item) => item.id === stockOut.materialId);
        if (status === "approved" && material && material.currentStock < stockOut.quantity) {
          return { error: "库存不足，无法审核通过出库" };
        }
        stockOut.status = status;
        if (status === "approved" && material) {
          material.currentStock -= stockOut.quantity;
          material.monthlyOut += stockOut.quantity;
        }
        return { target: stockOut, status };
      }
    }

    return { target: { targetType: parsed.data.targetType, targetId: parsed.data.targetId }, status };
  });

  if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 409 });

  return NextResponse.json({
    ok: true,
    data: {
      ...parsed.data,
      status: result.status,
      target: result.target,
      reviewedAt: new Date().toISOString(),
      reviewer: "周项目",
    },
  });
}

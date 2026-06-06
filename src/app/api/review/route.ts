import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { approvePrismaReview, getPrismaReviewItems } from "@/lib/prisma-repository";
import { closeReviewItem, updateStore } from "@/lib/server-store";
import { reviewSchema } from "@/lib/validators";
import type { ReviewStatus } from "@/types/enums";

type FinalReviewStatus = "approved" | "rejected";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaReviewItems() });
  const result = await updateStore((data) => data.reviewItems.filter((item) => item.status === "submitted"));
  return NextResponse.json({ ok: true, data: result });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "PM") {
    return NextResponse.json({ ok: false, error: "仅项目经理可以审核。" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "审核参数无效。", details: parsed.error.flatten() }, { status: 422 });
  }

  if (isPrismaBackendEnabled()) {
    try {
      const target = await approvePrismaReview(parsed.data.targetType, parsed.data.targetId, parsed.data.action, parsed.data.comment);
      const status = getReviewStatus(parsed.data.action);
      return NextResponse.json({
        ok: true,
        data: {
          ...parsed.data,
          status,
          target,
          reviewedAt: new Date().toISOString(),
          reviewer: session.user.name ?? "项目经理",
        },
      });
    } catch (error) {
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "审核失败。" }, { status: 409 });
    }
  }

  const result = await updateStore((data) => {
    const status = getReviewStatus(parsed.data.action);
    closeReviewItem(data, parsed.data.targetType, parsed.data.targetId, status);

    if (parsed.data.targetType === "documents") {
      const document = data.documents.find((item) => item.id === parsed.data.targetId);
      if (!document) return { error: "资料记录不存在。" };
      document.reviewStatus = status;
      document.aiSummary = parsed.data.comment ?? getDefaultReviewComment(status);
      return { target: document, status };
    }

    if (parsed.data.targetType === "daily-log") {
      const log = data.dailyLogs.find((item) => item.id === parsed.data.targetId);
      if (!log) return { error: "施工日志不存在。" };
      log.status = status;
      log.reviewedBy = session.user.name ?? "项目经理";
      log.reviewComment = parsed.data.comment ?? getDefaultReviewComment(status);
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
          return { error: "库存不足，无法审核通过出库单。" };
        }
        stockOut.status = status;
        if (status === "approved" && material) {
          material.currentStock -= stockOut.quantity;
          material.monthlyOut += stockOut.quantity;
        }
        return { target: stockOut, status };
      }

      return { error: "材料单据不存在。" };
    }

    if (parsed.data.targetType === "safety") {
      const hazard = data.hazards.find((item) => item.id === parsed.data.targetId);
      if (hazard) {
        hazard.status = status === "approved" ? "closed" : "rectifying";
        return { target: hazard, status };
      }

      const incident = data.incidents.find((item) => item.id === parsed.data.targetId);
      if (!incident) return { error: "安全记录不存在。" };
      incident.status = status;
      incident.reviewedBy = session.user.name ?? "项目经理";
      incident.reviewComment = parsed.data.comment ?? getDefaultReviewComment(status);
      return { target: incident, status };
    }

    if (parsed.data.targetType === "machinery") {
      const machinery = data.machinery.find((item) => item.id === parsed.data.targetId);
      if (!machinery) return { error: "机械记录不存在。" };
      machinery.status = status;
      return { target: machinery, status };
    }

    if (parsed.data.targetType === "archive") {
      const archive = data.archives.find((item) => item.id === parsed.data.targetId);
      if (!archive) return { error: "档案记录不存在。" };
      archive.status = status;
      return { target: archive, status };
    }

    if (parsed.data.targetType === "change-visa") {
      const change = data.changes.find((item) => item.id === parsed.data.targetId);
      if (change) {
        change.status = status;
        return { target: change, status };
      }

      const visa = data.visas.find((item) => item.id === parsed.data.targetId);
      if (!visa) return { error: "变更签证记录不存在。" };
      visa.status = status;
      return { target: visa, status };
    }

    return { error: "暂不支持该类型审核。" };
  });

  if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 409 });

  return NextResponse.json({
    ok: true,
    data: {
      ...parsed.data,
      status: result.status,
      target: result.target,
      reviewedAt: new Date().toISOString(),
      reviewer: session.user.name ?? "项目经理",
    },
  });
}

function getReviewStatus(action: "approve" | "reject" | "return"): FinalReviewStatus {
  return action === "approve" ? "approved" : "rejected";
}

function getDefaultReviewComment(status: ReviewStatus) {
  return status === "approved" ? "审核通过" : "退回修改";
}

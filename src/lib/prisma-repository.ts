import { prisma } from "./db";
import type { DailyLog, Material, ReviewItem, StockRecord } from "@/types";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getPrismaMaterials(): Promise<Material[]> {
  const rows = await prisma.material.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((item) => ({
    id: item.id,
    projectId: item.projectId,
    name: item.name,
    category: item.category,
    spec: item.spec,
    unit: item.unit,
    safetyStock: item.safetyStock,
    currentStock: item.currentStock,
    monthlyIn: 0,
    monthlyOut: 0,
  }));
}

export async function getPrismaDailyLogs(): Promise<DailyLog[]> {
  const rows = await prisma.dailyLog.findMany({
    include: { submittedBy: true, reviewedBy: true, attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    projectId: item.projectId,
    workDate: item.workDate.toISOString().slice(0, 10),
    weather: item.weather as DailyLog["weather"],
    tempLow: item.tempLow,
    tempHigh: item.tempHigh,
    workContent: item.workContent,
    workPosition: item.workPosition,
    workProcess: item.workProcess,
    laborCount: item.laborCount,
    laborDetail: parseJson(item.laborDetail, []),
    machineryUsed: parseJson(item.machineryUsed, []),
    materialUsed: parseJson(item.materialUsed, []),
    qualityCheck: item.qualityCheck ?? undefined,
    safetyCheck: item.safetyCheck ?? undefined,
    status: item.status as DailyLog["status"],
    submittedBy: item.submittedBy.displayName,
    reviewedBy: item.reviewedBy?.displayName,
    reviewComment: item.reviewComment ?? undefined,
    attachments: item.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      url: attachment.url,
      fileType: attachment.fileType,
      hasWatermark: attachment.hasWatermark,
    })),
  }));
}

export async function getPrismaStockIns(): Promise<StockRecord[]> {
  const rows = await prisma.stockIn.findMany({
    include: { material: true, submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    materialId: item.materialId,
    materialName: item.material.name,
    billNo: item.billNo,
    quantity: item.quantity,
    status: item.status as StockRecord["status"],
    submittedBy: item.submittedBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
    supplier: item.supplier,
  }));
}

export async function getPrismaStockOuts(): Promise<StockRecord[]> {
  const rows = await prisma.stockOut.findMany({
    include: { material: true, submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    materialId: item.materialId,
    materialName: item.material.name,
    billNo: item.billNo,
    quantity: item.quantity,
    status: item.status as StockRecord["status"],
    submittedBy: item.submittedBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
    receiver: item.receiver,
  }));
}

export async function getPrismaReviewItems(): Promise<ReviewItem[]> {
  const [logs, stockIns, stockOuts] = await Promise.all([
    prisma.dailyLog.findMany({ where: { status: "submitted" }, include: { submittedBy: true } }),
    prisma.stockIn.findMany({ where: { status: "submitted" }, include: { material: true, submittedBy: true } }),
    prisma.stockOut.findMany({ where: { status: "submitted" }, include: { material: true, submittedBy: true } }),
  ]);

  return [
    ...logs.map((item) => ({
      id: item.id,
      targetType: "daily-log" as const,
      title: `${item.workPosition}${item.workProcess}日志`,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: "normal" as const,
    })),
    ...stockIns.map((item) => ({
      id: item.id,
      targetType: "material" as const,
      title: `${item.material.name}入库 ${item.quantity}`,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: "normal" as const,
    })),
    ...stockOuts.map((item) => ({
      id: item.id,
      targetType: "material" as const,
      title: `${item.material.name}出库 ${item.quantity}`,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: "normal" as const,
    })),
  ];
}

export async function approvePrismaReview(targetType: string, targetId: string, action: "approve" | "reject" | "return", comment?: string) {
  const status = action === "approve" ? "approved" : "rejected";
  const reviewer = await prisma.user.findUniqueOrThrow({ where: { username: "pm" } });

  if (targetType === "daily-log") {
    return prisma.dailyLog.update({
      where: { id: targetId },
      data: {
        status,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
        reviewComment: comment,
      },
    });
  }

  if (targetType === "material") {
    const stockIn = await prisma.stockIn.findUnique({ where: { id: targetId } });
    if (stockIn) {
      return prisma.$transaction(async (tx) => {
        const updated = await tx.stockIn.update({
          where: { id: targetId },
          data: { status, reviewedById: reviewer.id, reviewedAt: new Date(), reviewComment: comment },
        });
        if (status === "approved") {
          await tx.material.update({
            where: { id: stockIn.materialId },
            data: { currentStock: { increment: stockIn.quantity } },
          });
        }
        return updated;
      });
    }

    const stockOut = await prisma.stockOut.findUnique({ where: { id: targetId }, include: { material: true } });
    if (stockOut) {
      if (status === "approved" && stockOut.material.currentStock < stockOut.quantity) {
        throw new Error("库存不足，无法审核通过出库");
      }
      return prisma.$transaction(async (tx) => {
        const updated = await tx.stockOut.update({
          where: { id: targetId },
          data: { status, reviewedById: reviewer.id, reviewedAt: new Date(), reviewComment: comment },
        });
        if (status === "approved") {
          await tx.material.update({
            where: { id: stockOut.materialId },
            data: { currentStock: { decrement: stockOut.quantity } },
          });
        }
        return updated;
      });
    }
  }

  throw new Error("待审记录不存在");
}


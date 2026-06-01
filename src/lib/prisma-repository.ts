import { prisma } from "./db";
import type { StoreData } from "./server-store";
import type {
  ArchiveFile,
  ArchiveRecord,
  ChangeRecord,
  DailyLog,
  Hazard,
  Machinery,
  Material,
  Project,
  ReviewItem,
  StockRecord,
  VisaRecord,
} from "@/types";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getPrismaProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    location: item.location,
    owner: item.owner,
    contractor: item.contractor,
    supervisor: item.supervisor ?? undefined,
    status: item.status as Project["status"],
    startDate: item.startDate.toISOString().slice(0, 10),
    plannedEndDate: item.plannedEndDate.toISOString().slice(0, 10),
  }));
}

export async function getPrismaMaterials(): Promise<Material[]> {
  const rows = await prisma.material.findMany({
    include: {
      stockIns: { where: { status: "approved" } },
      stockOuts: { where: { status: "approved" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    projectId: item.projectId,
    name: item.name,
    category: item.category,
    spec: item.spec,
    unit: item.unit,
    safetyStock: item.safetyStock,
    currentStock: item.currentStock,
    monthlyIn: item.stockIns.reduce((sum, record) => sum + record.quantity, 0),
    monthlyOut: item.stockOuts.reduce((sum, record) => sum + record.quantity, 0),
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

export async function getPrismaHazards(): Promise<Hazard[]> {
  const rows = await prisma.safetyHazard.findMany({
    include: { submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    area: item.area,
    riskLevel: item.riskLevel as Hazard["riskLevel"],
    status: item.status as Hazard["status"],
    owner: item.submittedBy.displayName,
    dueDate: item.dueDate.toISOString().slice(0, 10),
  }));
}

export async function getPrismaMachinery(): Promise<Machinery[]> {
  const rows = await prisma.machinery.findMany({
    include: { shiftRecords: true },
    orderBy: { enteredAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    operator: item.operator,
    status: item.status as Machinery["status"],
    nextMaintenanceDate: item.nextMaintenanceDate?.toISOString().slice(0, 10) ?? "",
    shiftsThisMonth: item.shiftRecords.length,
  }));
}

export async function getPrismaArchives(): Promise<ArchiveRecord[]> {
  const rows = await prisma.archive.findMany({
    include: { submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    tags: parseCsv(item.tags),
    version: item.version,
    status: item.status as ArchiveRecord["status"],
    submittedBy: item.submittedBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
  }));
}

export async function getPrismaArchiveFiles(): Promise<ArchiveFile[]> {
  const rows = await prisma.attachment.findMany({
    where: { archiveId: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    archiveId: item.archiveId ?? "",
    fileName: item.fileName,
    filePath: item.filePath,
    fileType: item.fileType,
    fileSize: item.fileSize,
    version: "v1.0",
    url: item.url,
    uploadedAt: item.createdAt.toLocaleString("zh-CN"),
  }));
}

export async function getPrismaChanges(): Promise<ChangeRecord[]> {
  const rows = await prisma.designChange.findMany({
    include: { submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    reason: item.reason,
    content: item.content,
    estimatedCost: item.estimatedCost,
    status: item.status as ChangeRecord["status"],
    submittedBy: item.submittedBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
  }));
}

export async function getPrismaVisas(): Promise<VisaRecord[]> {
  const rows = await prisma.engineeringVisa.findMany({
    include: { submittedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    visaType: item.visaType,
    totalAmount: item.totalAmount,
    status: item.status as VisaRecord["status"],
    submittedBy: item.submittedBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
  }));
}

export async function getPrismaReviewItems(): Promise<ReviewItem[]> {
  const [logs, stockIns, stockOuts, hazards, archives, changes, visas, machinery] = await Promise.all([
    prisma.dailyLog.findMany({ where: { status: "submitted" }, include: { submittedBy: true } }),
    prisma.stockIn.findMany({ where: { status: "submitted" }, include: { material: true, submittedBy: true } }),
    prisma.stockOut.findMany({ where: { status: "submitted" }, include: { material: true, submittedBy: true } }),
    prisma.safetyHazard.findMany({ where: { status: "reviewing" }, include: { submittedBy: true } }),
    prisma.archive.findMany({ where: { status: "submitted" }, include: { submittedBy: true } }),
    prisma.designChange.findMany({ where: { status: "submitted" }, include: { submittedBy: true } }),
    prisma.engineeringVisa.findMany({ where: { status: "submitted" }, include: { submittedBy: true } }),
    prisma.machinery.findMany({ where: { statusReview: "submitted" }, include: { submittedBy: true } }),
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
    ...hazards.map((item) => ({
      id: item.id,
      targetType: "safety" as const,
      title: item.title,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: item.riskLevel === "high" || item.riskLevel === "critical" ? ("urgent" as const) : ("normal" as const),
    })),
    ...archives.map((item) => ({
      id: item.id,
      targetType: "archive" as const,
      title: item.title,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: "normal" as const,
    })),
    ...changes.map((item) => ({
      id: item.id,
      targetType: "change-visa" as const,
      title: item.title,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: item.estimatedCost > 50_000 ? ("urgent" as const) : ("normal" as const),
    })),
    ...visas.map((item) => ({
      id: item.id,
      targetType: "change-visa" as const,
      title: item.title,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.createdAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: item.totalAmount > 50_000 ? ("urgent" as const) : ("normal" as const),
    })),
    ...machinery.map((item) => ({
      id: item.id,
      targetType: "machinery" as const,
      title: item.name,
      submittedBy: item.submittedBy.displayName,
      submittedAt: item.enteredAt.toLocaleString("zh-CN"),
      status: "submitted" as const,
      priority: "normal" as const,
    })),
  ];
}

export async function readPrismaStore(): Promise<StoreData> {
  const [
    projects,
    dailyLogs,
    materials,
    stockIns,
    stockOuts,
    hazards,
    machinery,
    reviewItems,
    archives,
    archiveFiles,
    changes,
    visas,
  ] = await Promise.all([
    getPrismaProjects(),
    getPrismaDailyLogs(),
    getPrismaMaterials(),
    getPrismaStockIns(),
    getPrismaStockOuts(),
    getPrismaHazards(),
    getPrismaMachinery(),
    getPrismaReviewItems(),
    getPrismaArchives(),
    getPrismaArchiveFiles(),
    getPrismaChanges(),
    getPrismaVisas(),
  ]);

  const project = projects[0];
  if (!project) throw new Error("Prisma backend has no project seed data. Run npm.cmd run db:seed.");

  return {
    project,
    dailyLogs,
    materials,
    stockIns,
    stockOuts,
    hazards,
    machinery,
    reviewItems,
    archives,
    archiveFiles,
    changes,
    visas,
  };
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

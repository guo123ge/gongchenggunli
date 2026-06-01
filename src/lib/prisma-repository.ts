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
import type { dailyLogSchema, materialSchema } from "@/lib/validators";
import type { z } from "zod";

type DailyLogInput = z.infer<typeof dailyLogSchema>;
type MaterialInput = z.infer<typeof materialSchema>;

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

async function getDefaultSubmittedById(username = "pm") {
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) return user.id;
  const fallback = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!fallback) throw new Error("Prisma backend has no user seed data. Run npm.cmd run db:seed.");
  return fallback.id;
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

export async function createPrismaMaterial(input: MaterialInput): Promise<Material> {
  const created = await prisma.material.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      category: input.category,
      spec: input.spec,
      unit: input.unit,
      safetyStock: input.safetyStock,
      currentStock: 0,
    },
    include: { stockIns: true, stockOuts: true },
  });
  return {
    id: created.id,
    projectId: created.projectId,
    name: created.name,
    category: created.category,
    spec: created.spec,
    unit: created.unit,
    safetyStock: created.safetyStock,
    currentStock: created.currentStock,
    monthlyIn: 0,
    monthlyOut: 0,
  };
}

export async function updatePrismaMaterial(id: string, body: Record<string, unknown>): Promise<Material | null> {
  const exists = await prisma.material.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.material.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      spec: typeof body.spec === "string" ? body.spec : undefined,
      unit: typeof body.unit === "string" ? body.unit : undefined,
      safetyStock: body.safetyStock === undefined ? undefined : Number(body.safetyStock),
      currentStock: body.currentStock === undefined ? undefined : Number(body.currentStock),
    },
    include: { stockIns: { where: { status: "approved" } }, stockOuts: { where: { status: "approved" } } },
  });
  return {
    id: updated.id,
    projectId: updated.projectId,
    name: updated.name,
    category: updated.category,
    spec: updated.spec,
    unit: updated.unit,
    safetyStock: updated.safetyStock,
    currentStock: updated.currentStock,
    monthlyIn: updated.stockIns.reduce((sum, record) => sum + record.quantity, 0),
    monthlyOut: updated.stockOuts.reduce((sum, record) => sum + record.quantity, 0),
  };
}

export async function deletePrismaMaterial(id: string) {
  const exists = await prisma.material.findUnique({ where: { id } });
  if (!exists) return false;
  await prisma.$transaction([
    prisma.stockIn.deleteMany({ where: { materialId: id } }),
    prisma.stockOut.deleteMany({ where: { materialId: id } }),
    prisma.material.delete({ where: { id } }),
  ]);
  return true;
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

export async function createPrismaDailyLog(input: DailyLogInput): Promise<DailyLog> {
  const submittedById = await getDefaultSubmittedById("con");
  const created = await prisma.dailyLog.create({
    data: {
      projectId: input.projectId,
      workDate: input.workDate,
      weather: input.weather,
      tempLow: input.tempLow,
      tempHigh: input.tempHigh,
      workContent: input.workContent,
      workPosition: input.workPosition,
      workProcess: input.workProcess,
      laborCount: input.laborCount,
      laborDetail: JSON.stringify(input.laborDetail),
      machineryUsed: JSON.stringify(input.machineryUsed),
      materialUsed: JSON.stringify(input.materialUsed),
      qualityCheck: input.qualityCheck,
      safetyCheck: input.safetyCheck,
      status: input.status,
      submittedById,
    },
    include: { submittedBy: true, reviewedBy: true, attachments: true },
  });
  return {
    id: created.id,
    projectId: created.projectId,
    workDate: created.workDate.toISOString().slice(0, 10),
    weather: created.weather as DailyLog["weather"],
    tempLow: created.tempLow,
    tempHigh: created.tempHigh,
    workContent: created.workContent,
    workPosition: created.workPosition,
    workProcess: created.workProcess,
    laborCount: created.laborCount,
    laborDetail: parseJson(created.laborDetail, []),
    machineryUsed: parseJson(created.machineryUsed, []),
    materialUsed: parseJson(created.materialUsed, []),
    qualityCheck: created.qualityCheck ?? undefined,
    safetyCheck: created.safetyCheck ?? undefined,
    status: created.status as DailyLog["status"],
    submittedBy: created.submittedBy.displayName,
    reviewedBy: created.reviewedBy?.displayName,
    reviewComment: created.reviewComment ?? undefined,
    attachments: [],
  };
}

export async function updatePrismaDailyLog(id: string, body: Record<string, unknown>): Promise<DailyLog | null> {
  const existing = await prisma.dailyLog.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.status === "approved") {
    const [item] = (await getPrismaDailyLogs()).filter((log) => log.id === id);
    return item ?? null;
  }
  const updated = await prisma.dailyLog.update({
    where: { id },
    data: {
      workDate: body.workDate === undefined ? undefined : new Date(String(body.workDate)),
      weather: typeof body.weather === "string" ? body.weather : undefined,
      tempLow: body.tempLow === undefined ? undefined : Number(body.tempLow),
      tempHigh: body.tempHigh === undefined ? undefined : Number(body.tempHigh),
      workContent: typeof body.workContent === "string" ? body.workContent : undefined,
      workPosition: typeof body.workPosition === "string" ? body.workPosition : undefined,
      workProcess: typeof body.workProcess === "string" ? body.workProcess : undefined,
      laborCount: body.laborCount === undefined ? undefined : Number(body.laborCount),
      laborDetail: Array.isArray(body.laborDetail) ? JSON.stringify(body.laborDetail) : undefined,
      machineryUsed: Array.isArray(body.machineryUsed) ? JSON.stringify(body.machineryUsed) : undefined,
      materialUsed: Array.isArray(body.materialUsed) ? JSON.stringify(body.materialUsed) : undefined,
      qualityCheck: typeof body.qualityCheck === "string" ? body.qualityCheck : undefined,
      safetyCheck: typeof body.safetyCheck === "string" ? body.safetyCheck : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
    },
    include: { submittedBy: true, reviewedBy: true, attachments: true },
  });
  return {
    id: updated.id,
    projectId: updated.projectId,
    workDate: updated.workDate.toISOString().slice(0, 10),
    weather: updated.weather as DailyLog["weather"],
    tempLow: updated.tempLow,
    tempHigh: updated.tempHigh,
    workContent: updated.workContent,
    workPosition: updated.workPosition,
    workProcess: updated.workProcess,
    laborCount: updated.laborCount,
    laborDetail: parseJson(updated.laborDetail, []),
    machineryUsed: parseJson(updated.machineryUsed, []),
    materialUsed: parseJson(updated.materialUsed, []),
    qualityCheck: updated.qualityCheck ?? undefined,
    safetyCheck: updated.safetyCheck ?? undefined,
    status: updated.status as DailyLog["status"],
    submittedBy: updated.submittedBy.displayName,
    reviewedBy: updated.reviewedBy?.displayName,
    reviewComment: updated.reviewComment ?? undefined,
    attachments: updated.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      url: attachment.url,
      fileType: attachment.fileType,
      hasWatermark: attachment.hasWatermark,
    })),
  };
}

export async function deletePrismaDraftDailyLog(id: string) {
  const result = await prisma.dailyLog.deleteMany({ where: { id, status: "draft" } });
  return result.count > 0;
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

export async function createPrismaStockIn(body: Record<string, unknown>): Promise<StockRecord> {
  const materialId = String(body.materialId ?? "");
  const material = await prisma.material.findUniqueOrThrow({ where: { id: materialId } });
  const submittedById = await getDefaultSubmittedById("mat");
  const created = await prisma.stockIn.create({
    data: {
      projectId: material.projectId,
      materialId,
      billNo: String(body.billNo ?? `RK-${Date.now()}`),
      supplier: String(body.supplier ?? "待补充"),
      quantity: Number(body.quantity ?? 0),
      status: "submitted",
      submittedById,
    },
    include: { material: true, submittedBy: true },
  });
  return {
    id: created.id,
    materialId: created.materialId,
    materialName: created.material.name,
    billNo: created.billNo,
    quantity: created.quantity,
    status: created.status as StockRecord["status"],
    submittedBy: created.submittedBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
    supplier: created.supplier,
  };
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

export async function createPrismaStockOut(body: Record<string, unknown>): Promise<StockRecord> {
  const materialId = String(body.materialId ?? "");
  const material = await prisma.material.findUniqueOrThrow({ where: { id: materialId } });
  const quantity = Number(body.quantity ?? 0);
  if (quantity > material.currentStock) throw new Error("库存不足，无法提交出库");
  const submittedById = await getDefaultSubmittedById("mat");
  const created = await prisma.stockOut.create({
    data: {
      projectId: material.projectId,
      materialId,
      billNo: String(body.billNo ?? `CK-${Date.now()}`),
      receiver: String(body.receiver ?? "待补充"),
      usagePosition: String(body.usagePosition ?? "未指定"),
      quantity,
      status: "submitted",
      submittedById,
    },
    include: { material: true, submittedBy: true },
  });
  return {
    id: created.id,
    materialId: created.materialId,
    materialName: created.material.name,
    billNo: created.billNo,
    quantity: created.quantity,
    status: created.status as StockRecord["status"],
    submittedBy: created.submittedBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
    receiver: created.receiver,
  };
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

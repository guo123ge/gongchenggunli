import { prisma } from "./db";
import type { StoreData } from "./server-store";
import type {
  ArchiveFile,
  ArchiveRecord,
  ChangeRecord,
  DailyLog,
  Hazard,
  Machinery,
  MaintenanceRecord,
  Material,
  Project,
  ReviewItem,
  SafetyIncident,
  ShiftRecord,
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
  if (!fallback) throw new Error("Prisma 后端缺少用户种子数据，请先执行 npm.cmd run db:seed。");
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

export async function createPrismaHazard(body: Record<string, unknown>): Promise<Hazard> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("safe");
  const created = await prisma.safetyHazard.create({
    data: {
      projectId,
      title: String(body.title ?? "未命名隐患"),
      area: String(body.area ?? "未指定区域"),
      riskLevel: String(body.riskLevel ?? "medium"),
      description: String(body.description ?? body.title ?? "待补充"),
      rectification: typeof body.rectification === "string" ? body.rectification : undefined,
      status: String(body.status ?? "open"),
      dueDate: new Date(String(body.dueDate ?? new Date().toISOString())),
      submittedById,
    },
    include: { submittedBy: true },
  });
  return {
    id: created.id,
    title: created.title,
    area: created.area,
    riskLevel: created.riskLevel as Hazard["riskLevel"],
    status: created.status as Hazard["status"],
    owner: created.submittedBy.displayName,
    dueDate: created.dueDate.toISOString().slice(0, 10),
  };
}

export async function updatePrismaHazard(id: string, body: Record<string, unknown>): Promise<Hazard | null> {
  const exists = await prisma.safetyHazard.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.safetyHazard.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      area: typeof body.area === "string" ? body.area : undefined,
      riskLevel: typeof body.riskLevel === "string" ? body.riskLevel : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      rectification: typeof body.rectification === "string" ? body.rectification : undefined,
      dueDate: body.dueDate === undefined ? undefined : new Date(String(body.dueDate)),
    },
    include: { submittedBy: true },
  });
  return {
    id: updated.id,
    title: updated.title,
    area: updated.area,
    riskLevel: updated.riskLevel as Hazard["riskLevel"],
    status: updated.status as Hazard["status"],
    owner: updated.submittedBy.displayName,
    dueDate: updated.dueDate.toISOString().slice(0, 10),
  };
}

export async function getPrismaIncidents(): Promise<SafetyIncident[]> {
  const rows = await prisma.safetyIncident.findMany({
    include: { submittedBy: true, reviewedBy: true },
    orderBy: { incidentDate: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    projectId: item.projectId,
    title: item.title,
    incidentDate: item.incidentDate.toISOString().slice(0, 10),
    level: item.level as SafetyIncident["level"],
    description: item.description,
    status: item.status as SafetyIncident["status"],
    submittedBy: item.submittedBy.displayName,
    reviewedBy: item.reviewedBy?.displayName,
    reviewComment: item.reviewComment ?? undefined,
  }));
}

export async function createPrismaIncident(body: Record<string, unknown>): Promise<SafetyIncident> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("safe");
  const created = await prisma.safetyIncident.create({
    data: {
      projectId,
      title: String(body.title ?? "未命名安全事件"),
      incidentDate: new Date(String(body.incidentDate ?? new Date().toISOString())),
      level: String(body.level ?? body.riskLevel ?? "medium"),
      description: String(body.description ?? body.title ?? "待补充事件描述"),
      status: String(body.status ?? "submitted"),
      submittedById,
    },
    include: { submittedBy: true, reviewedBy: true },
  });
  return {
    id: created.id,
    projectId: created.projectId,
    title: created.title,
    incidentDate: created.incidentDate.toISOString().slice(0, 10),
    level: created.level as SafetyIncident["level"],
    description: created.description,
    status: created.status as SafetyIncident["status"],
    submittedBy: created.submittedBy.displayName,
    reviewedBy: created.reviewedBy?.displayName,
    reviewComment: created.reviewComment ?? undefined,
  };
}

export async function updatePrismaIncident(id: string, body: Record<string, unknown>): Promise<SafetyIncident | null> {
  const exists = await prisma.safetyIncident.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.safetyIncident.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      incidentDate: body.incidentDate === undefined ? undefined : new Date(String(body.incidentDate)),
      level: typeof body.level === "string" ? body.level : typeof body.riskLevel === "string" ? body.riskLevel : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      reviewComment: typeof body.reviewComment === "string" ? body.reviewComment : undefined,
    },
    include: { submittedBy: true, reviewedBy: true },
  });
  return {
    id: updated.id,
    projectId: updated.projectId,
    title: updated.title,
    incidentDate: updated.incidentDate.toISOString().slice(0, 10),
    level: updated.level as SafetyIncident["level"],
    description: updated.description,
    status: updated.status as SafetyIncident["status"],
    submittedBy: updated.submittedBy.displayName,
    reviewedBy: updated.reviewedBy?.displayName,
    reviewComment: updated.reviewComment ?? undefined,
  };
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

export async function createPrismaMachinery(body: Record<string, unknown>): Promise<Machinery> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("mach");
  const created = await prisma.machinery.create({
    data: {
      projectId,
      name: String(body.name ?? "未命名机械"),
      code: String(body.code ?? `MC-${Date.now()}`),
      model: String(body.model ?? "待补充"),
      operator: String(body.operator ?? "待分配"),
      status: String(body.status ?? "submitted"),
      enteredAt: new Date(String(body.enteredAt ?? new Date().toISOString())),
      nextMaintenanceDate: body.nextMaintenanceDate === undefined ? undefined : new Date(String(body.nextMaintenanceDate)),
      submittedById,
    },
    include: { shiftRecords: true },
  });
  return {
    id: created.id,
    name: created.name,
    code: created.code,
    operator: created.operator,
    status: created.status as Machinery["status"],
    nextMaintenanceDate: created.nextMaintenanceDate?.toISOString().slice(0, 10) ?? "",
    shiftsThisMonth: created.shiftRecords.length,
  };
}

export async function updatePrismaMachinery(id: string, body: Record<string, unknown>): Promise<Machinery | null> {
  const exists = await prisma.machinery.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.machinery.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name : undefined,
      code: typeof body.code === "string" ? body.code : undefined,
      model: typeof body.model === "string" ? body.model : undefined,
      operator: typeof body.operator === "string" ? body.operator : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      nextMaintenanceDate: body.nextMaintenanceDate === undefined ? undefined : new Date(String(body.nextMaintenanceDate)),
    },
    include: { shiftRecords: true },
  });
  return {
    id: updated.id,
    name: updated.name,
    code: updated.code,
    operator: updated.operator,
    status: updated.status as Machinery["status"],
    nextMaintenanceDate: updated.nextMaintenanceDate?.toISOString().slice(0, 10) ?? "",
    shiftsThisMonth: updated.shiftRecords.length,
  };
}

export async function deletePrismaMachinery(id: string) {
  const exists = await prisma.machinery.findUnique({ where: { id } });
  if (!exists) return false;
  await prisma.$transaction([
    prisma.maintenanceRecord.deleteMany({ where: { machineryId: id } }),
    prisma.shiftRecord.deleteMany({ where: { machineryId: id } }),
    prisma.machinery.delete({ where: { id } }),
  ]);
  return true;
}

export async function getPrismaMaintenanceRecords(machineryId: string): Promise<MaintenanceRecord[]> {
  const rows = await prisma.maintenanceRecord.findMany({
    where: { machineryId },
    include: { handledBy: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    machineryId: item.machineryId,
    content: item.content,
    cost: item.cost ?? 0,
    handledBy: item.handledBy.displayName,
    createdAt: item.createdAt.toLocaleString("zh-CN"),
  }));
}

export async function createPrismaMaintenanceRecord(machineryId: string, body: Record<string, unknown>): Promise<MaintenanceRecord> {
  await prisma.machinery.findUniqueOrThrow({ where: { id: machineryId } });
  const handledById = await getDefaultSubmittedById("mach");
  const created = await prisma.maintenanceRecord.create({
    data: {
      machineryId,
      content: String(body.content ?? "Maintenance record"),
      cost: Number(body.cost ?? 0),
      handledById,
    },
    include: { handledBy: true },
  });
  return {
    id: created.id,
    machineryId: created.machineryId,
    content: created.content,
    cost: created.cost ?? 0,
    handledBy: created.handledBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
  };
}

export async function getPrismaShiftRecords(machineryId: string): Promise<ShiftRecord[]> {
  const rows = await prisma.shiftRecord.findMany({
    where: { machineryId },
    include: { submittedBy: true },
    orderBy: { workDate: "desc" },
  });
  return rows.map((item) => ({
    id: item.id,
    machineryId: item.machineryId,
    workDate: item.workDate.toISOString().slice(0, 10),
    shiftHours: item.shiftHours,
    workContent: item.workContent,
    submittedBy: item.submittedBy.displayName,
  }));
}

export async function createPrismaShiftRecord(machineryId: string, body: Record<string, unknown>): Promise<ShiftRecord> {
  await prisma.machinery.findUniqueOrThrow({ where: { id: machineryId } });
  const submittedById = await getDefaultSubmittedById("mach");
  const created = await prisma.shiftRecord.create({
    data: {
      machineryId,
      workDate: new Date(String(body.workDate ?? new Date().toISOString())),
      shiftHours: Number(body.shiftHours ?? 0),
      workContent: String(body.workContent ?? "台班作业"),
      submittedById,
    },
    include: { submittedBy: true },
  });
  return {
    id: created.id,
    machineryId: created.machineryId,
    workDate: created.workDate.toISOString().slice(0, 10),
    shiftHours: created.shiftHours,
    workContent: created.workContent,
    submittedBy: created.submittedBy.displayName,
  };
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

export async function createPrismaArchive(body: Record<string, unknown>): Promise<ArchiveRecord> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("doc");
  const tags = Array.isArray(body.tags) ? body.tags.join(",") : String(body.tags ?? "");
  const created = await prisma.archive.create({
    data: {
      projectId,
      title: String(body.title ?? "未命名档案"),
      category: String(body.category ?? "其他"),
      tags,
      version: String(body.version ?? "v1.0"),
      status: String(body.status ?? "submitted"),
      submittedById,
    },
    include: { submittedBy: true },
  });
  return {
    id: created.id,
    title: created.title,
    category: created.category,
    tags: parseCsv(created.tags),
    version: created.version,
    status: created.status as ArchiveRecord["status"],
    submittedBy: created.submittedBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
  };
}

export async function updatePrismaArchive(id: string, body: Record<string, unknown>): Promise<ArchiveRecord | null> {
  const exists = await prisma.archive.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.archive.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      tags: Array.isArray(body.tags) ? body.tags.join(",") : typeof body.tags === "string" ? body.tags : undefined,
      version: typeof body.version === "string" ? body.version : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
    },
    include: { submittedBy: true },
  });
  return {
    id: updated.id,
    title: updated.title,
    category: updated.category,
    tags: parseCsv(updated.tags),
    version: updated.version,
    status: updated.status as ArchiveRecord["status"],
    submittedBy: updated.submittedBy.displayName,
    createdAt: updated.createdAt.toLocaleString("zh-CN"),
  };
}

export async function deletePrismaArchive(id: string) {
  const result = await prisma.archive.deleteMany({ where: { id } });
  return result.count > 0;
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

export async function getPrismaArchiveFilesByArchiveId(archiveId: string): Promise<ArchiveFile[]> {
  const all = await getPrismaArchiveFiles();
  return all.filter((item) => item.archiveId === archiveId);
}

export async function createPrismaArchiveFile(archiveId: string, body: Record<string, unknown>): Promise<ArchiveFile> {
  const created = await prisma.attachment.create({
    data: {
      archiveId,
      fileName: String(body.fileName ?? "未命名文件"),
      filePath: String(body.filePath ?? ""),
      fileType: String(body.fileType ?? "application/octet-stream"),
      fileSize: Number(body.fileSize ?? 0),
      url: String(body.url ?? ""),
    },
  });
  return {
    id: created.id,
    archiveId: created.archiveId ?? archiveId,
    fileName: created.fileName,
    filePath: created.filePath,
    fileType: created.fileType,
    fileSize: created.fileSize,
    version: String(body.version ?? "v1.0"),
    url: created.url,
    uploadedAt: created.createdAt.toLocaleString("zh-CN"),
  };
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

export async function createPrismaChange(body: Record<string, unknown>): Promise<ChangeRecord> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("tech");
  const created = await prisma.designChange.create({
    data: {
      projectId,
      changeNo: String(body.changeNo ?? `BG-${Date.now()}`),
      title: String(body.title ?? "未命名变更"),
      reason: String(body.reason ?? "待补充"),
      content: String(body.content ?? ""),
      impact: String(body.impact ?? "待评估"),
      estimatedCost: Number(body.estimatedCost ?? body.amount ?? 0),
      status: String(body.status ?? "submitted"),
      submittedById,
    },
    include: { submittedBy: true },
  });
  return {
    id: created.id,
    title: created.title,
    reason: created.reason,
    content: created.content,
    estimatedCost: created.estimatedCost,
    status: created.status as ChangeRecord["status"],
    submittedBy: created.submittedBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
  };
}

export async function updatePrismaChange(id: string, body: Record<string, unknown>): Promise<ChangeRecord | null> {
  const exists = await prisma.designChange.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.designChange.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      reason: typeof body.reason === "string" ? body.reason : undefined,
      content: typeof body.content === "string" ? body.content : undefined,
      impact: typeof body.impact === "string" ? body.impact : undefined,
      estimatedCost: body.estimatedCost === undefined && body.amount === undefined ? undefined : Number(body.estimatedCost ?? body.amount),
      status: typeof body.status === "string" ? body.status : undefined,
    },
    include: { submittedBy: true },
  });
  return {
    id: updated.id,
    title: updated.title,
    reason: updated.reason,
    content: updated.content,
    estimatedCost: updated.estimatedCost,
    status: updated.status as ChangeRecord["status"],
    submittedBy: updated.submittedBy.displayName,
    createdAt: updated.createdAt.toLocaleString("zh-CN"),
  };
}

export async function deletePrismaChange(id: string) {
  const result = await prisma.designChange.deleteMany({ where: { id } });
  return result.count > 0;
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

export async function createPrismaVisa(body: Record<string, unknown>): Promise<VisaRecord> {
  const projectId = String(body.projectId ?? (await getPrismaProjects())[0]?.id ?? "");
  if (!projectId) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");
  const submittedById = await getDefaultSubmittedById("tech");
  const created = await prisma.engineeringVisa.create({
    data: {
      projectId,
      visaNo: String(body.visaNo ?? `QZ-${Date.now()}`),
      title: String(body.title ?? "未命名签证"),
      visaType: String(body.visaType ?? "standard"),
      visaReason: String(body.visaReason ?? body.reason ?? "待补充"),
      visaContent: String(body.visaContent ?? body.content ?? ""),
      constructionPosition: String(body.constructionPosition ?? "未指定"),
      quantities: Array.isArray(body.quantities) ? JSON.stringify(body.quantities) : String(body.quantities ?? "[]"),
      totalAmount: Number(body.totalAmount ?? body.amount ?? 0),
      status: String(body.status ?? "submitted"),
      submittedById,
    },
    include: { submittedBy: true },
  });
  return {
    id: created.id,
    title: created.title,
    visaType: created.visaType,
    totalAmount: created.totalAmount,
    status: created.status as VisaRecord["status"],
    submittedBy: created.submittedBy.displayName,
    createdAt: created.createdAt.toLocaleString("zh-CN"),
  };
}

export async function updatePrismaVisa(id: string, body: Record<string, unknown>): Promise<VisaRecord | null> {
  const exists = await prisma.engineeringVisa.findUnique({ where: { id } });
  if (!exists) return null;
  const updated = await prisma.engineeringVisa.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : undefined,
      visaType: typeof body.visaType === "string" ? body.visaType : undefined,
      visaReason: typeof body.visaReason === "string" ? body.visaReason : undefined,
      visaContent: typeof body.visaContent === "string" ? body.visaContent : undefined,
      constructionPosition: typeof body.constructionPosition === "string" ? body.constructionPosition : undefined,
      quantities: Array.isArray(body.quantities) ? JSON.stringify(body.quantities) : typeof body.quantities === "string" ? body.quantities : undefined,
      totalAmount: body.totalAmount === undefined && body.amount === undefined ? undefined : Number(body.totalAmount ?? body.amount),
      status: typeof body.status === "string" ? body.status : undefined,
    },
    include: { submittedBy: true },
  });
  return {
    id: updated.id,
    title: updated.title,
    visaType: updated.visaType,
    totalAmount: updated.totalAmount,
    status: updated.status as VisaRecord["status"],
    submittedBy: updated.submittedBy.displayName,
    createdAt: updated.createdAt.toLocaleString("zh-CN"),
  };
}

export async function deletePrismaVisa(id: string) {
  const result = await prisma.engineeringVisa.deleteMany({ where: { id } });
  return result.count > 0;
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
    incidents,
    machinery,
    maintenanceRecords,
    shiftRecords,
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
    getPrismaIncidents(),
    getPrismaMachinery(),
    prisma.maintenanceRecord
      .findMany({ include: { handledBy: true }, orderBy: { createdAt: "desc" } })
      .then((rows) =>
        rows.map((item) => ({
          id: item.id,
          machineryId: item.machineryId,
          content: item.content,
          cost: item.cost ?? 0,
          handledBy: item.handledBy.displayName,
          createdAt: item.createdAt.toLocaleString("zh-CN"),
        })),
      ),
    prisma.shiftRecord
      .findMany({ include: { submittedBy: true }, orderBy: { workDate: "desc" } })
      .then((rows) =>
        rows.map((item) => ({
          id: item.id,
          machineryId: item.machineryId,
          workDate: item.workDate.toISOString().slice(0, 10),
          shiftHours: item.shiftHours,
          workContent: item.workContent,
          submittedBy: item.submittedBy.displayName,
        })),
      ),
    getPrismaReviewItems(),
    getPrismaArchives(),
    getPrismaArchiveFiles(),
    getPrismaChanges(),
    getPrismaVisas(),
  ]);

  const project = projects[0];
  if (!project) throw new Error("Prisma 后端缺少项目种子数据，请先执行 npm.cmd run db:seed。");

  return {
    project,
    projects,
    dailyLogs,
    materials,
    stockIns,
    stockOuts,
    hazards,
    registrationRequests: [],
    incidents,
    machinery,
    maintenanceRecords,
    shiftRecords,
    reviewItems,
    archives,
    archiveFiles,
    documents: [],
    changes,
    visas,
    quantities: [],
    quantityUpdates: [],
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

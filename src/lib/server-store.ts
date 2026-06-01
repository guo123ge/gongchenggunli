import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  dailyLogs,
  dashboardSummary,
  hazards,
  machinery,
  materials,
  project,
  reviewItems,
  stockIns,
  stockOuts,
} from "./mock-data";
import type {
  ArchiveFile,
  ArchiveRecord,
  ChangeRecord,
  DailyLog,
  DashboardSummary,
  Hazard,
  Machinery,
  Material,
  ReviewItem,
  StockRecord,
  VisaRecord,
} from "@/types";

type StoreData = {
  project: typeof project;
  dailyLogs: DailyLog[];
  materials: Material[];
  stockIns: StockRecord[];
  stockOuts: StockRecord[];
  hazards: Hazard[];
  machinery: Machinery[];
  reviewItems: ReviewItem[];
  archiveFiles: ArchiveFile[];
  archives: ArchiveRecord[];
  changes: ChangeRecord[];
  visas: VisaRecord[];
};

const dataDir = path.join(process.cwd(), ".local-data");
const dataFile = path.join(dataDir, "store.json");
const lockDir = path.join(dataDir, "store.lock");
let storeUpdateQueue: Promise<unknown> = Promise.resolve();

const initialData: StoreData = {
  project,
  dailyLogs,
  materials,
  stockIns,
  stockOuts,
  hazards,
  machinery,
  reviewItems,
  archives: [
    {
      id: "ar-001",
      title: "地下室防水专项方案",
      category: "方案",
      tags: ["防水", "地下室"],
      version: "v1.2",
      status: "approved",
      submittedBy: "宋资料",
      createdAt: "2026-05-30 10:00",
    },
    {
      id: "ar-002",
      title: "钢筋原材复试报告",
      category: "试验",
      tags: ["钢筋", "复试"],
      version: "v1.0",
      status: "submitted",
      submittedBy: "宋资料",
      createdAt: "2026-05-31 16:00",
    },
  ],
  changes: [
    {
      id: "chg-001",
      title: "地下室集水坑位置调整",
      reason: "现场管线综合调整",
      content: "集水坑向东偏移 600mm，避让主排水管线。",
      estimatedCost: 18600,
      status: "submitted",
      submittedBy: "吴技术",
      createdAt: "2026-05-31 15:00",
    },
  ],
  visas: [
    {
      id: "visa-001",
      title: "夜间抢工增加照明台班",
      visaType: "material_machinery",
      totalAmount: 5760,
      status: "draft",
      submittedBy: "吴技术",
      createdAt: "2026-05-31 18:30",
    },
  ],
  archiveFiles: [
    {
      id: "file-001",
      archiveId: "ar-002",
      fileName: "复试报告.pdf",
      filePath: "/logo.svg",
      fileType: "application/pdf",
      fileSize: 0,
      version: "v1.0",
      url: "/logo.svg",
      uploadedAt: "2026-05-31 18:00",
    },
  ],
};

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeStoreFile(initialData);
  }
}

export async function readStore(): Promise<StoreData> {
  return withStoreLock(readStoreFile);
}

async function readStoreFile(): Promise<StoreData> {
  await ensureStoreFile();
  const raw = await readFile(dataFile, "utf8");
  const data = JSON.parse(raw) as StoreData;
  data.archiveFiles ??= initialData.archiveFiles;
  data.archives ??= initialData.archives;
  data.changes ??= initialData.changes;
  data.visas ??= initialData.visas;
  return data;
}

export async function writeStore(data: StoreData) {
  return enqueueStoreUpdate(() => withStoreLock(() => writeStoreFile(data)));
}

export async function updateStore<T>(updater: (data: StoreData) => T | Promise<T>) {
  return enqueueStoreUpdate(async () => {
    return withStoreLock(async () => {
      const data = await readStoreFile();
      const result = await updater(data);
      await writeStoreFile(data);
      return result;
    });
  });
}

async function writeStoreFile(data: StoreData) {
  await mkdir(dataDir, { recursive: true });
  const tempFile = path.join(dataDir, `store.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  try {
    await writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
    await replaceStoreFile(tempFile);
  } catch (error) {
    await rm(tempFile, { force: true }).catch(() => undefined);
    throw error;
  }
}

async function enqueueStoreUpdate<T>(task: () => Promise<T>) {
  const run = storeUpdateQueue.then(task, task);
  storeUpdateQueue = run.catch(() => undefined);
  return run;
}

async function withStoreLock<T>(task: () => Promise<T>): Promise<T> {
  const release = await acquireStoreLock();
  try {
    return await task();
  } finally {
    await release();
  }
}

async function acquireStoreLock() {
  await mkdir(dataDir, { recursive: true });
  const deadline = Date.now() + 15_000;

  for (;;) {
    try {
      await mkdir(lockDir);
      return () => rm(lockDir, { recursive: true, force: true });
    } catch (error) {
      if (getErrorCode(error) !== "EEXIST") throw error;
      if (Date.now() > deadline) {
        await rm(lockDir, { recursive: true, force: true }).catch(() => undefined);
      }
      await delay(25);
    }
  }
}

async function replaceStoreFile(tempFile: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rename(tempFile, dataFile);
      return;
    } catch (error) {
      lastError = error;
      if (!["EACCES", "EBUSY", "EPERM"].includes(getErrorCode(error))) throw error;
      await delay(25 * (attempt + 1));
    }
  }
  throw lastError;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return "";
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}

export function calculateDashboardSummary(data: StoreData): DashboardSummary {
  return {
    pendingReviews: data.reviewItems.filter((item) => item.status === "submitted").length,
    overdueItems: dashboardSummary.overdueItems,
    safetyHazards: data.hazards.length,
    lowStockMaterials: data.materials.filter((item) => item.currentStock < item.safetyStock).length,
    maintenanceDue: data.machinery.filter((item) => item.nextMaintenanceDate <= "2026-06-05").length,
  };
}

export function addReviewItem(data: StoreData, item: ReviewItem) {
  const exists = data.reviewItems.some((review) => review.id === item.id && review.targetType === item.targetType);
  if (!exists) data.reviewItems.unshift(item);
}

export function closeReviewItem(data: StoreData, targetType: ReviewItem["targetType"], targetId: string, status: "approved" | "rejected") {
  const review = data.reviewItems.find((item) => item.targetType === targetType && item.id === targetId);
  if (review) review.status = status;
}

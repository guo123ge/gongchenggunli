import { mkdir, readFile, writeFile } from "node:fs/promises";
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
import type { ArchiveFile, DailyLog, DashboardSummary, Hazard, Machinery, Material, ReviewItem, StockRecord } from "@/types";

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
};

const dataDir = path.join(process.cwd(), ".local-data");
const dataFile = path.join(dataDir, "store.json");

const initialData: StoreData = {
  project,
  dailyLogs,
  materials,
  stockIns,
  stockOuts,
  hazards,
  machinery,
  reviewItems,
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

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeStore(initialData);
  }
}

export async function readStore(): Promise<StoreData> {
  await ensureStore();
  const raw = await readFile(dataFile, "utf8");
  const data = JSON.parse(raw) as StoreData;
  data.archiveFiles ??= initialData.archiveFiles;
  return data;
}

export async function writeStore(data: StoreData) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export async function updateStore<T>(updater: (data: StoreData) => T | Promise<T>) {
  const data = await readStore();
  const result = await updater(data);
  await writeStore(data);
  return result;
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

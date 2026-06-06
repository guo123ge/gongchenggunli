import type { QuantityItem, QuantityStatus } from "@/types";

export function getRemainingQuantity(item: Pick<QuantityItem, "totalQuantity" | "completedQuantity">) {
  return Math.max(0, Number(item.totalQuantity) - Number(item.completedQuantity));
}

export function getQuantityPercent(item: Pick<QuantityItem, "totalQuantity" | "completedQuantity">) {
  if (Number(item.totalQuantity) <= 0) return 0;
  return Math.min(100, Math.round((Number(item.completedQuantity) / Number(item.totalQuantity)) * 1000) / 10);
}

export function getRemainingDays(plannedFinishDate?: string, currentDate = new Date()) {
  if (!plannedFinishDate) return null;
  const plan = new Date(`${plannedFinishDate}T00:00:00`);
  if (Number.isNaN(plan.getTime())) return null;
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((plan.getTime() - today.getTime()) / 86_400_000);
}

export function deriveQuantityStatus(item: Pick<QuantityItem, "totalQuantity" | "completedQuantity" | "plannedFinishDate">, currentDate = new Date()): QuantityStatus {
  const percent = getQuantityPercent(item);
  const remainingDays = getRemainingDays(item.plannedFinishDate, currentDate);
  if (percent >= 100) return "completed";
  if (remainingDays !== null && remainingDays < 0) return "overdue";
  if (remainingDays !== null && remainingDays <= 3 && percent < 90) return "delayed";
  if (Number(item.completedQuantity) <= 0) return "not_started";
  return "in_progress";
}

export function formatQuantityStatus(status: QuantityStatus) {
  const labels: Record<QuantityStatus, string> = {
    not_started: "未开始",
    in_progress: "进行中",
    completed: "已完成",
    delayed: "滞后",
    overdue: "超期",
  };
  return labels[status];
}

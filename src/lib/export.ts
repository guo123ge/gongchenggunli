import type { DailyLog, Material } from "@/types";

type CsvData = {
  dailyLogs: DailyLog[];
  materials: Material[];
};

function csvCell(value: string | number | undefined) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRow(values: Array<string | number | undefined>) {
  return values.map(csvCell).join(",");
}

export function buildCsv(type: string, data: CsvData) {
  if (type === "material-ledger") {
    return [
      csvRow(["Material", "Spec", "Unit", "Current stock", "Safety stock", "Monthly in", "Monthly out"]),
      ...data.materials.map((item) =>
        csvRow([item.name, item.spec, item.unit, item.currentStock, item.safetyStock, item.monthlyIn, item.monthlyOut]),
      ),
    ].join("\n");
  }

  if (type === "daily-log-summary") {
    return [
      csvRow(["Date", "Position", "Process", "Labor count", "Status", "Submitted by"]),
      ...data.dailyLogs.map((item) =>
        csvRow([item.workDate, item.workPosition, item.workProcess, item.laborCount, item.status, item.submittedBy]),
      ),
    ].join("\n");
  }

  return [
    csvRow(["Type", "Message"]),
    csvRow([type, "Unsupported export type. Available: daily-log-summary, material-ledger"]),
  ].join("\n");
}

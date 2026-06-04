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
      csvRow(["材料名称", "规格", "单位", "当前库存", "安全库存", "本月入库", "本月出库"]),
      ...data.materials.map((item) =>
        csvRow([item.name, item.spec, item.unit, item.currentStock, item.safetyStock, item.monthlyIn, item.monthlyOut]),
      ),
    ].join("\n");
  }

  if (type === "daily-log-summary") {
    return [
      csvRow(["日期", "施工部位", "工序", "用工人数", "状态", "提交人"]),
      ...data.dailyLogs.map((item) =>
        csvRow([item.workDate, item.workPosition, item.workProcess, item.laborCount, item.status, item.submittedBy]),
      ),
    ].join("\n");
  }

  return [
    csvRow(["类型", "说明"]),
    csvRow([type, "不支持的导出类型，可用值：daily-log-summary、material-ledger"]),
  ].join("\n");
}

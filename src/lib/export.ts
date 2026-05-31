import { dailyLogs, materials } from "./mock-data";

export function buildCsv(type: string) {
  if (type === "material-ledger") {
    return [
      ["材料", "规格", "单位", "当前库存", "安全库存"].join(","),
      ...materials.map((item) => [item.name, item.spec, item.unit, item.currentStock, item.safetyStock].join(",")),
    ].join("\n");
  }

  return [
    ["日期", "部位", "工序", "人数", "状态"].join(","),
    ...dailyLogs.map((item) => [item.workDate, item.workPosition, item.workProcess, item.laborCount, item.status].join(",")),
  ].join("\n");
}


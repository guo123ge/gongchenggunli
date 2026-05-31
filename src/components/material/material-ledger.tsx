import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { StockRecord } from "@/types";

export function MaterialLedger({ records }: { records: StockRecord[] }) {
  return (
    <DataTable
      rows={records}
      columns={[
        { key: "billNo", header: "单号", render: (row) => row.billNo },
        { key: "materialName", header: "材料", render: (row) => row.materialName },
        { key: "quantity", header: "数量", render: (row) => row.quantity },
        { key: "submittedBy", header: "提交人", render: (row) => row.submittedBy },
        { key: "status", header: "状态", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}


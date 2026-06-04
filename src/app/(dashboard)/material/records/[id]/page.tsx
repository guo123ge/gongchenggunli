import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function MaterialRecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const stockIn = data.stockIns.find((item) => item.id === id);
  const stockOut = data.stockOuts.find((item) => item.id === id);
  const record = stockIn ?? stockOut;
  const typeLabel = stockIn ? "入库单据" : stockOut ? "出库单据" : "材料单据";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link href="/review">
          <Button variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回审核中心
          </Button>
        </Link>
        <Link href="/material">
          <Button variant="ghost">返回材料管理</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{record ? `${typeLabel}：${record.billNo}` : `材料单据 #${id}`}</CardTitle>
            <CardDescription>查看材料收发单据明细、提交信息和审核状态。</CardDescription>
          </div>
          {record && <StatusBadge status={record.status} />}
        </CardHeader>

        {record ? (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <Info label="材料名称" value={record.materialName} />
            <Info label="单据编号" value={record.billNo} />
            <Info label="数量" value={String(record.quantity)} />
            <Info label="提交人" value={record.submittedBy} />
            <Info label="提交时间" value={record.createdAt} />
            <Info label={stockIn ? "供应商" : "领用人"} value={stockIn?.supplier ?? stockOut?.receiver ?? "待补充"} />
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-panel-soft p-4 text-sm text-muted">未找到对应材料单据，可能已被删除或不属于当前项目。</p>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel-soft p-4">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

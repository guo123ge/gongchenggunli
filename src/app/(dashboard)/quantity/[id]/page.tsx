import Link from "next/link";
import { notFound } from "next/navigation";
import { QuantityForm } from "@/components/quantity/quantity-form";
import { QuantityUpdateForm } from "@/components/quantity/quantity-update-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatQuantityStatus, getQuantityPercent, getRemainingDays, getRemainingQuantity } from "@/lib/quantity-utils";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function QuantityDetailPage({ params }: { params: { id: string } }) {
  const data = await readAppData();
  const quantity = data.quantities.find((item) => item.id === params.id);
  if (!quantity) notFound();
  const updates = data.quantityUpdates.filter((item) => item.quantityId === quantity.id);
  const percent = getQuantityPercent(quantity);
  const remaining = getRemainingQuantity(quantity);
  const remainingDays = getRemainingDays(quantity.plannedFinishDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">工程量详情</p>
          <h1 className="mt-2 text-3xl font-black text-white">{quantity.name}</h1>
          <p className="mt-2 text-muted">{quantity.category} / {quantity.workArea} / 责任人 {quantity.owner}</p>
        </div>
        <Link href="/quantity">
          <Button variant="secondary">返回工程量</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>进度计量</CardTitle>
            <CardDescription>以实体工程量作为完成百分比计算基础。</CardDescription>
          </div>
          <span className="rounded-full border border-brand/40 px-3 py-1 text-sm font-semibold text-brand">{formatQuantityStatus(quantity.status)}</span>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-6">
          <Info label="全部数量" value={`${quantity.totalQuantity} ${quantity.unit}`} />
          <Info label="已完工程量" value={`${quantity.completedQuantity} ${quantity.unit}`} />
          <Info label="剩余工程量" value={`${remaining} ${quantity.unit}`} />
          <Info label="完成百分比" value={`${percent}%`} />
          <Info label="计划完工日期" value={quantity.plannedFinishDate ?? "未设置"} />
          <Info label="剩余工期" value={remainingDays === null ? "未设置" : `${remainingDays} 天`} />
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
        {quantity.remark && <p className="mt-4 rounded-2xl bg-panel-soft p-4 text-sm text-muted">{quantity.remark}</p>}
      </Card>

      <QuantityUpdateForm quantity={quantity} />
      <QuantityForm project={data.project} initial={quantity} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>完成量更新记录</CardTitle>
            <CardDescription>保留每次现场填报、计量依据和偏差原因。</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {updates.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-panel-soft p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <p className="font-semibold text-white">{item.updatedAt} / 本次完成 {item.completedAmount} {quantity.unit}</p>
                <p className="text-sm text-muted">填报人：{item.submittedBy}</p>
              </div>
              <p className="mt-2 text-sm text-slate-200">{item.description}</p>
              {item.delayReason && <p className="mt-2 text-sm text-amber-100">偏差原因：{item.delayReason}</p>}
            </div>
          ))}
          {updates.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-panel-soft p-4 text-sm text-muted">暂无完成量更新记录。</p>}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-panel-soft p-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { CostSummary } from "@/components/change-visa/cost-summary";
import { QuantityTable } from "@/components/change-visa/quantity-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function ChangeVisaPage() {
  const data = await readAppData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black text-white">变更签证</h1>
          <p className="mt-2 text-muted">管理设计变更、工程签证、费用汇总与审核状态。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/change-visa/changes/new"><Button variant="secondary">新建变更</Button></Link>
          <Link href="/change-visa/visas/new"><Button>新建签证</Button></Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>变更记录</CardTitle>
              <CardDescription>通过接口提交的设计变更记录。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {data.changes.map((item) => (
              <Link
                key={item.id}
                href={`/change-visa/changes/${item.id}`}
                className="block rounded-2xl border border-border bg-panel/60 p-4 transition hover:border-brand/50"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.reason} / {item.submittedBy} / 预估费用 {item.estimatedCost}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </Link>
            ))}
            {data.changes.length === 0 && <p className="text-sm text-muted">暂无变更记录。</p>}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>签证记录</CardTitle>
              <CardDescription>通过接口提交的工程签证记录。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {data.visas.map((item) => (
              <Link
                key={item.id}
                href={`/change-visa/visas/${item.id}`}
                className="block rounded-2xl border border-border bg-panel/60 p-4 transition hover:border-brand/50"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.visaType} / {item.submittedBy} / 总金额 {item.totalAmount}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </Link>
            ))}
            {data.visas.length === 0 && <p className="text-sm text-muted">暂无签证记录。</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card><CardHeader><div><CardTitle>工程量台账</CardTitle><CardDescription>支持按金额排序与状态筛选。</CardDescription></div></CardHeader><QuantityTable /></Card>
        <CostSummary />
      </div>
    </div>
  );
}

import Link from "next/link";
import { CostSummary } from "@/components/change-visa/cost-summary";
import { QuantityTable } from "@/components/change-visa/quantity-table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChangeVisaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><h1 className="text-3xl font-black text-white">变更签证</h1><p className="mt-2 text-muted">设计变更、工程签证、费用汇总和签章状态。</p></div>
        <div className="flex gap-2"><Link href="/change-visa/changes/new"><Button variant="secondary">设计变更</Button></Link><Link href="/change-visa/visas/new"><Button>工程签证</Button></Link></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card><CardHeader><div><CardTitle>工程量台账</CardTitle><CardDescription>按金额排序和审核状态筛选</CardDescription></div></CardHeader><QuantityTable /></Card>
        <CostSummary />
      </div>
    </div>
  );
}


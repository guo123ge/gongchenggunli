import Link from "next/link";
import { MaterialLedger } from "@/components/material/material-ledger";
import { Button } from "@/components/ui/button";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function StockOutPage() {
  const data = await readAppData();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">出库列表</h1>
          <p className="mt-2 text-muted">领料出库、库存校验、审核后扣减库存。</p>
        </div>
        <Link href="/material/stock-out/new"><Button>新建出库</Button></Link>
      </div>
      <MaterialLedger records={data.stockOuts} />
    </div>
  );
}

import Link from "next/link";
import { MaterialLedger } from "@/components/material/material-ledger";
import { Button } from "@/components/ui/button";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function StockInPage() {
  const data = await readAppData();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">入库列表</h1>
          <p className="mt-2 text-muted">记录材料进场、单据上传与审核入库流程。</p>
        </div>
        <Link href="/material/stock-in/new"><Button>新建入库</Button></Link>
      </div>
      <MaterialLedger records={data.stockIns} />
    </div>
  );
}

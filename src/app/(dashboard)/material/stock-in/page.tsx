import Link from "next/link";
import { MaterialLedger } from "@/components/material/material-ledger";
import { Button } from "@/components/ui/button";
import { stockIns } from "@/lib/mock-data";

export default function StockInPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">入库列表</h1>
          <p className="mt-2 text-muted">材料进场、单据上传、审核后增加库存。</p>
        </div>
        <Link href="/material/stock-in/new"><Button>新建入库</Button></Link>
      </div>
      <MaterialLedger records={stockIns} />
    </div>
  );
}


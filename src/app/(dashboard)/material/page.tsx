import Link from "next/link";
import { InventoryBoard } from "@/components/material/inventory-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { materials } from "@/lib/mock-data";

export default function MaterialPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">Material</p>
          <h1 className="mt-2 text-3xl font-black text-white">材料管理</h1>
          <p className="mt-2 text-muted">实时库存、低库存预警、入库/出库审核闭环。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/material/stock-in/new"><Button variant="secondary">入库</Button></Link>
          <Link href="/material/stock-out/new"><Button>出库</Button></Link>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-panel/70 p-4">
        <Input placeholder="搜索材料名称、规格、供应商..." />
      </div>
      <InventoryBoard materials={materials} />
    </div>
  );
}


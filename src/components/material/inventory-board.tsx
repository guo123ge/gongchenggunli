import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Material } from "@/types";

export function InventoryBoard({ materials }: { materials: Material[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {materials.map((item) => {
        const ratio = Math.min(1, item.currentStock / Math.max(item.safetyStock, 1));
        const low = item.currentStock < item.safetyStock;
        return (
          <Card key={item.id} className={low ? "border-yellow-400/40" : undefined}>
            <CardHeader>
              <div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.category} · {item.spec}
                </CardDescription>
              </div>
              {low && <span className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold text-yellow-100">低库存</span>}
            </CardHeader>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-black text-white">
                  {item.currentStock}
                  <span className="ml-1 text-sm font-medium text-muted">{item.unit}</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  安全库存 {item.safetyStock} {item.unit}
                </p>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className={low ? "h-2 rounded-full bg-yellow-400" : "h-2 rounded-full bg-success"}
                  style={{ width: `${Math.max(ratio, 0.08) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-panel-soft p-3">
                  <p className="text-muted">本月入库</p>
                  <p className="mt-1 font-bold text-white">{item.monthlyIn}</p>
                </div>
                <div className="rounded-2xl bg-panel-soft p-3">
                  <p className="text-muted">本月出库</p>
                  <p className="mt-1 font-bold text-white">{item.monthlyOut}</p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}


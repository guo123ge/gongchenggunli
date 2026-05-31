import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Material } from "@/types";

export function InventoryAlerts({ materials }: { materials: Material[] }) {
  const lowStocks = materials.filter((item) => item.currentStock < item.safetyStock);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>库存预警</CardTitle>
          <CardDescription>低于安全库存自动标红</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {lowStocks.map((item) => (
          <div key={item.id} className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-3">
            <p className="font-semibold text-yellow-100">{item.name}</p>
            <p className="mt-1 text-sm text-muted">
              当前 {item.currentStock} {item.unit} / 安全库存 {item.safetyStock} {item.unit}
            </p>
          </div>
        ))}
        {lowStocks.length === 0 && <p className="text-sm text-muted">当前无低库存材料。</p>}
      </div>
    </Card>
  );
}


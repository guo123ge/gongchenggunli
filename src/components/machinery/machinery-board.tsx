import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Machinery } from "@/types";

export function MachineryBoard({ items }: { items: Machinery[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.code} · 操作手 {item.operator}</CardDescription>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">{item.status}</span>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-panel-soft p-3"><p className="text-muted">本月台班</p><p className="mt-1 text-2xl font-black">{item.shiftsThisMonth}</p></div>
            <div className="rounded-2xl bg-panel-soft p-3"><p className="text-muted">下次保养</p><p className="mt-1 font-bold">{item.nextMaintenanceDate}</p></div>
          </div>
        </Card>
      ))}
    </div>
  );
}


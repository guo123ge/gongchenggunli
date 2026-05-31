import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Machinery } from "@/types";

export function MaintenanceAlerts({ machinery }: { machinery: Machinery[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>机械保养提醒</CardTitle>
          <CardDescription>设备到期、台班和在场状态</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {machinery.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-panel/60 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.name}</p>
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted">{item.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {item.operator} · 本月 {item.shiftsThisMonth} 台班 · 下次保养 {item.nextMaintenanceDate}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}


import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Machinery } from "@/types";

export function MaintenanceAlerts({ machinery }: { machinery: Machinery[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>机械保养提醒</CardTitle>
          <CardDescription>设备到期、台班和在场状态，点击设备进入详情。</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {machinery.map((item) => (
          <Link key={item.id} href={`/machinery/${item.id}`} className="block rounded-2xl border border-border bg-panel/60 p-3 transition hover:border-brand/60">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.name}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {item.operator} / 本月 {item.shiftsThisMonth} 台班 / 下次保养 {item.nextMaintenanceDate}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Machinery } from "@/types";

export function MachineryBoard({ items }: { items: Machinery[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <Link key={item.id} href={`/machinery/${item.id}`} className="block transition hover:-translate-y-0.5">
          <Card className="h-full hover:border-brand/60">
            <CardHeader>
              <div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.code} / 操作手 {item.operator}
                </CardDescription>
              </div>
              <StatusBadge status={item.status} />
            </CardHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">本月台班</p>
                <p className="mt-1 text-2xl font-black">{item.shiftsThisMonth}</p>
              </div>
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">下次保养</p>
                <p className="mt-1 font-bold">{item.nextMaintenanceDate}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
      {items.length === 0 && <p className="rounded-3xl border border-dashed border-border p-5 text-sm text-muted">当前项目暂无机械进场记录。</p>}
    </div>
  );
}

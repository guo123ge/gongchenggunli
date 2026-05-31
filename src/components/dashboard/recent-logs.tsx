import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DailyLog } from "@/types";

export function RecentLogs({ logs }: { logs: DailyLog[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>最近施工日志</CardTitle>
          <CardDescription>同步查看作业面、工序、人员与现场照片</CardDescription>
        </div>
        <Link href="/daily-log/new" className="text-sm font-semibold text-brand">
          新建日志
        </Link>
      </CardHeader>
      <div className="space-y-3">
        {logs.map((log) => (
          <Link key={log.id} href={`/daily-log/${log.id}`} className="block rounded-2xl border border-border bg-panel/60 p-3 transition hover:border-brand/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{log.workPosition}</p>
                <p className="mt-1 text-sm text-muted">{log.workContent}</p>
              </div>
              <StatusBadge status={log.status} />
            </div>
            <p className="mt-2 text-xs text-muted">
              {log.workDate} · {log.weather} · {log.tempLow}-{log.tempHigh}℃ · {log.laborCount} 人
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}


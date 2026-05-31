import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DailyLog } from "@/types";

export function LogCard({ log }: { log: DailyLog }) {
  return (
    <Link href={`/daily-log/${log.id}`} className="block rounded-3xl border border-border bg-panel/70 p-5 transition hover:-translate-y-0.5 hover:border-brand/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{log.workDate}</p>
          <h3 className="mt-2 text-xl font-bold text-white">{log.workPosition}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{log.workContent}</p>
        </div>
        <StatusBadge status={log.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1">{log.weather}</span>
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1">
          {log.tempLow}-{log.tempHigh}℃
        </span>
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1">{log.laborCount} 人</span>
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1">{log.workProcess}</span>
      </div>
    </Link>
  );
}


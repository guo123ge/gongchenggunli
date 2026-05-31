import Link from "next/link";
import { LogCard } from "@/components/daily-log/log-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dailyLogs } from "@/lib/mock-data";

export default function DailyLogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">Daily Log</p>
          <h1 className="mt-2 text-3xl font-black text-white">施工日志</h1>
          <p className="mt-2 text-muted">按日期、天气、状态筛选，施工员只看自己的记录，PM 看项目全部记录。</p>
        </div>
        <Link href="/daily-log/new">
          <Button>新建日志</Button>
        </Link>
      </div>

      <div className="grid gap-3 rounded-3xl border border-border bg-panel/70 p-4 md:grid-cols-4">
        <Input type="date" defaultValue="2026-05-31" />
        <Input placeholder="天气" />
        <Input placeholder="状态" />
        <Input placeholder="施工部位关键字" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {dailyLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}


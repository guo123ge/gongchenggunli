import Link from "next/link";
import { LogCard } from "@/components/daily-log/log-card";
import { ManualDateInput } from "@/components/shared/manual-date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function DailyLogPage() {
  const data = await readAppData();
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">施工日志</p>
          <h1 className="mt-2 text-3xl font-black text-white">施工日志</h1>
          <p className="mt-2 text-muted">按日期、天气、状态筛选，施工员查看本人记录，项目经理查看项目全部记录。</p>
        </div>
        <Link href="/daily-log/new">
          <Button>新建日志</Button>
        </Link>
      </div>

      <div className="grid gap-3 rounded-3xl border border-border bg-panel/70 p-4 md:grid-cols-4">
        <ManualDateInput defaultValue="20260531" />
        <Input placeholder="天气" />
        <Input placeholder="状态" />
        <Input placeholder="施工部位关键字" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.dailyLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}

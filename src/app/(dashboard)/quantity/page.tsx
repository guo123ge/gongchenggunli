import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatQuantityStatus, getQuantityPercent, getRemainingDays, getRemainingQuantity } from "@/lib/quantity-utils";
import { readAppData } from "@/lib/app-data";
import type { QuantityItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function QuantityPage() {
  const data = await readAppData();
  const quantities = data.quantities;
  const delayed = quantities.filter((item) => item.status === "delayed" || item.status === "overdue");
  const totalCount = quantities.length;
  const completedCount = quantities.filter((item) => getQuantityPercent(item) >= 100).length;
  const averagePercent = totalCount === 0 ? 0 : Math.round(quantities.reduce((sum, item) => sum + getQuantityPercent(item), 0) / totalCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">工程量</p>
          <h1 className="mt-2 text-3xl font-black text-white">工程量台账</h1>
          <p className="mt-2 text-muted">按实体工程量跟踪总量、已完、剩余、完成率和计划日期。</p>
        </div>
        <Link href="/quantity/new">
          <Button>新建工程量</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={ListChecks} label="工程量项" value={`${totalCount}`} />
        <Stat icon={CheckCircle2} label="已完成项" value={`${completedCount}`} />
        <Stat icon={AlertTriangle} label="滞后/超期" value={`${delayed.length}`} />
        <Stat icon={CalendarClock} label="平均完成率" value={`${averagePercent}%`} />
      </div>

      {delayed.length > 0 && (
        <Card className="border-amber-400/30 bg-amber-400/10">
          <CardHeader>
            <div>
              <CardTitle>进度预警</CardTitle>
              <CardDescription>以下工程量存在滞后或超期风险，请及时核对资源、作业面和计划日期。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {delayed.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/quantity/${item.id}`} className="block rounded-2xl border border-amber-300/20 bg-black/20 p-3 text-amber-50 transition hover:border-amber-300/60">
                {item.name} / {formatQuantityStatus(item.status)} / 完成 {getQuantityPercent(item)}%
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="rounded-3xl border border-border bg-panel/70 p-4">
        <Input placeholder="搜索工程量名称、施工部位、责任人或专业类别" />
      </div>

      <div className="grid gap-4">
        {quantities.map((item) => (
          <QuantityRow key={item.id} item={item} />
        ))}
        {quantities.length === 0 && <Card>当前项目暂无工程量，请先新建工程量台账。</Card>}
      </div>
    </div>
  );
}

function QuantityRow({ item }: { item: QuantityItem }) {
  const percent = getQuantityPercent(item);
  const remaining = getRemainingQuantity(item);
  const remainingDays = getRemainingDays(item.plannedFinishDate);
  return (
    <Link href={`/quantity/${item.id}`} className="rounded-3xl border border-border bg-panel/70 p-5 transition hover:border-brand/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-brand">{item.category} / {item.workArea}</p>
          <h2 className="mt-1 text-xl font-bold text-white">{item.name}</h2>
          <p className="mt-2 text-sm text-muted">责任人：{item.owner} / 计划完工：{item.plannedFinishDate ?? "未设置"}</p>
        </div>
        <div className="grid gap-3 text-sm md:grid-cols-4 md:text-right">
          <Info label="全部数量" value={`${item.totalQuantity} ${item.unit}`} />
          <Info label="已完" value={`${item.completedQuantity} ${item.unit}`} />
          <Info label="剩余" value={`${remaining} ${item.unit}`} />
          <Info label="剩余工期" value={remainingDays === null ? "未设置" : `${remainingDays} 天`} />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>{formatQuantityStatus(item.status)}</span>
        <span>{percent}%</span>
      </div>
    </Link>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <Icon className="size-5 text-brand" />
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { ClipboardCheck, HardHat, ShieldAlert, Truck } from "lucide-react";
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts";
import { MaintenanceAlerts } from "@/components/dashboard/maintenance-alerts";
import { PendingReview } from "@/components/dashboard/pending-review";
import { RecentLogs } from "@/components/dashboard/recent-logs";
import { SafetyOverview } from "@/components/dashboard/safety-overview";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CommandPalette } from "@/components/layout/command-palette";
import { readAppData } from "@/lib/app-data";
import { calculateDashboardSummary } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const snapshotItems = [
  { label: "现场作业人数", href: "/daily-log", icon: HardHat },
  { label: "在场机械", href: "/machinery", icon: Truck },
  { label: "待审记录", href: "/review", icon: ClipboardCheck },
  { label: "整改任务", href: "/safety", icon: ShieldAlert },
];

export default async function DashboardPage() {
  const data = await readAppData();
  const summary = calculateDashboardSummary(data);
  const todayLabor = data.dailyLogs[0]?.laborCount ?? 0;
  const snapshotValues = [
    todayLabor,
    data.machinery.length,
    summary.pendingReviews,
    data.hazards.filter((item) => item.status !== "closed").length,
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-panel/70 p-6 shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm text-brand">施工现场总览</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
              将施工日志、材料收发、安全隐患与审核流统一到一个平台
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              当前项目：{data.project.name}。本系统已支持多角色协同、审核中心、离线队列和核心业务模块入口。
            </p>
          </div>
          <div className="rounded-[2rem] border border-brand/20 bg-brand/10 p-5">
            <p className="text-sm text-muted">今日现场快照</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {snapshotItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-2xl bg-black/20 p-4 outline-none transition hover:bg-black/30 focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98]"
                    aria-label={`查看${item.label}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-3xl font-black text-white">{snapshotValues[index]}</p>
                        <p className="mt-1 text-xs text-muted transition group-hover:text-slate-200">{item.label}</p>
                      </div>
                      <Icon className="mt-1 size-4 text-brand opacity-70 transition group-hover:opacity-100" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <StatCards summary={summary} />
      <CommandPalette />

      <div className="grid gap-6 xl:grid-cols-2">
        <PendingReview items={data.reviewItems} />
        <RecentLogs logs={data.dailyLogs} />
        <InventoryAlerts materials={data.materials} />
        <SafetyOverview hazards={data.hazards} />
        <MaintenanceAlerts machinery={data.machinery} />
      </div>
    </div>
  );
}

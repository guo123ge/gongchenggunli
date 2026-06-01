import { InventoryAlerts } from "@/components/dashboard/inventory-alerts";
import { MaintenanceAlerts } from "@/components/dashboard/maintenance-alerts";
import { PendingReview } from "@/components/dashboard/pending-review";
import { RecentLogs } from "@/components/dashboard/recent-logs";
import { SafetyOverview } from "@/components/dashboard/safety-overview";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CommandPalette } from "@/components/layout/command-palette";
import { calculateDashboardSummary, readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await readStore();
  const summary = calculateDashboardSummary(data);
  const todayLabor = data.dailyLogs[0]?.laborCount ?? 0;
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-panel/70 p-6 shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand">Phase 1 MVP</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
              把施工日志、材料收发、安全隐患和审核流收进同一个现场驾驶舱。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              当前项目：{data.project.name}。本 MVP 已按计划书铺设多角色协同、审核中心、PWA 离线队列和核心业务模块入口。
            </p>
          </div>
          <div className="rounded-[2rem] border border-brand/20 bg-brand/10 p-5">
            <p className="text-sm text-muted">今日现场快照</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-3xl font-black text-white">{todayLabor}</p>
                <p className="text-xs text-muted">现场作业人数</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-3xl font-black text-white">{data.machinery.length}</p>
                <p className="text-xs text-muted">在场机械</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-3xl font-black text-white">{summary.pendingReviews}</p>
                <p className="text-xs text-muted">待审记录</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-3xl font-black text-white">{data.hazards.filter((item) => item.status !== "closed").length}</p>
                <p className="text-xs text-muted">整改任务</p>
              </div>
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

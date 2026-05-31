import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaborStats } from "@/components/daily-log/labor-stats";
import { ReviewFlow } from "@/components/shared/review-flow";
import { StatusBadge } from "@/components/shared/status-badge";
import { WatermarkPhoto } from "@/components/shared/watermark-photo";
import { project } from "@/lib/mock-data";
import type { DailyLog } from "@/types";

export function LogDetail({ log }: { log: DailyLog }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{log.workPosition} · {log.workProcess}</CardTitle>
            <CardDescription>
              {log.workDate} · {log.weather} · {log.tempLow}-{log.tempHigh}℃ · 提交人 {log.submittedBy}
            </CardDescription>
          </div>
          <StatusBadge status={log.status} />
        </CardHeader>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4 text-sm leading-7 text-slate-200">
            <section>
              <h3 className="mb-2 font-semibold text-white">施工内容</h3>
              <p>{log.workContent}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-white">质量检查</h3>
              <p>{log.qualityCheck}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-white">安全检查</h3>
              <p>{log.safetyCheck}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-white">人员统计</h3>
              <LaborStats log={log} />
            </section>
          </div>
          <div className="space-y-4">
            <WatermarkPhoto src="/logo.svg" projectName={project.name} position={log.workPosition} />
            <div className="rounded-2xl border border-border bg-panel-soft p-4">
              <p className="font-semibold text-white">审核操作</p>
              <p className="mt-1 text-sm text-muted">PM 可对提交记录统一审批，审批通过后记录锁定。</p>
              <div className="mt-4">
                <ReviewFlow targetType="daily-log" targetId={log.id} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


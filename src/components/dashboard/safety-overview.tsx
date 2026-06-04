import Link from "next/link";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hazard } from "@/types";

export function SafetyOverview({ hazards }: { hazards: Hazard[] }) {
  const activeHazards = hazards.filter((hazard) => hazard.status !== "closed" && !hasDirtyText(hazard.title, hazard.area, hazard.owner));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>安全态势</CardTitle>
          <CardDescription>展示未关闭隐患，点击隐患进入详情。</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {activeHazards.map((hazard) => (
          <Link key={hazard.id} href={`/safety/hazards/${hazard.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-panel/60 p-3 transition hover:border-brand/60">
            <div>
              <p className="font-semibold">{hazard.title}</p>
              <p className="mt-1 text-xs text-muted">
                {hazard.area} / 责任人 {hazard.owner} / 截止 {hazard.dueDate}
              </p>
            </div>
            <RiskBadge level={hazard.riskLevel} />
          </Link>
        ))}
        {activeHazards.length === 0 && <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">当前暂无未关闭安全隐患。</p>}
      </div>
    </Card>
  );
}

function hasDirtyText(...values: string[]) {
  return values.some((value) => value.includes("???"));
}

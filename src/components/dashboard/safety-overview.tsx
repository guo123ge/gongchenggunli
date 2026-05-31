import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/shared/risk-badge";
import type { Hazard } from "@/types";

export function SafetyOverview({ hazards }: { hazards: Hazard[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>安全态势</CardTitle>
          <CardDescription>隐患、整改、复查一张图</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {hazards.map((hazard) => (
          <div key={hazard.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-panel/60 p-3">
            <div>
              <p className="font-semibold">{hazard.title}</p>
              <p className="mt-1 text-xs text-muted">
                {hazard.area} · 责任人 {hazard.owner} · 截止 {hazard.dueDate}
              </p>
            </div>
            <RiskBadge level={hazard.riskLevel} />
          </div>
        ))}
      </div>
    </Card>
  );
}


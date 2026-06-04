import { RiskBadge } from "@/components/shared/risk-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";
import { notFound } from "next/navigation";
import type { ReviewStatus } from "@/types/enums";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const incident = data.incidents.find((item) => item.id === id);
  if (!incident) notFound();

  const reviewStatus: ReviewStatus = incident.status === "closed" ? "approved" : incident.status;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{incident.title}</CardTitle>
            <CardDescription>
              {incident.incidentDate} / {incident.submittedBy}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <RiskBadge level={incident.level} />
            <StatusBadge status={reviewStatus} />
          </div>
        </CardHeader>
        <div className="rounded-2xl border border-border bg-panel/60 p-4 text-sm leading-7 text-slate-200">
          {incident.description}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>事件流转</CardTitle>
            <CardDescription>展示提交、审核、复盘备注与归档衔接状态。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["提交人", incident.submittedBy],
            ["审核人", incident.reviewedBy ?? "待审核"],
            ["审核备注", incident.reviewComment ?? "暂无审核备注"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-panel/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

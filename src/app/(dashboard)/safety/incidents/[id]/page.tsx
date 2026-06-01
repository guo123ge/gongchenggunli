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
            <CardTitle>Incident workflow</CardTitle>
            <CardDescription>Submission, review status, replay notes, and archive handoff.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Submitted by", incident.submittedBy],
            ["Reviewed by", incident.reviewedBy ?? "Pending"],
            ["Review note", incident.reviewComment ?? "No review note yet"],
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

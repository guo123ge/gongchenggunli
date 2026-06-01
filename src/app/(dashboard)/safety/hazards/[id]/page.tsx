import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RectificationFlow } from "@/components/safety/rectification-flow";
import { RiskBadge } from "@/components/shared/risk-badge";
import { readAppData } from "@/lib/app-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HazardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const hazard = data.hazards.find((item) => item.id === id);
  if (!hazard) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{hazard.title}</CardTitle>
            <CardDescription>{hazard.area} · 责任人 {hazard.owner} · 截止 {hazard.dueDate}</CardDescription>
          </div>
          <RiskBadge level={hazard.riskLevel} />
        </CardHeader>
        <p className="text-sm leading-7 text-slate-200">整改要求：清理风险区域，补齐防护设施，上传整改前后对比照片后发起复查。</p>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>整改闭环</CardTitle><CardDescription>通知、回复、复查、关闭</CardDescription></div></CardHeader>
        <RectificationFlow />
      </Card>
    </div>
  );
}

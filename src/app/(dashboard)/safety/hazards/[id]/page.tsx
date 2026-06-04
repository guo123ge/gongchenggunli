import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RectificationFlow } from "@/components/safety/rectification-flow";
import { RiskBadge } from "@/components/shared/risk-badge";
import { ReviewFlow } from "@/components/shared/review-flow";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

const statusLabel = {
  open: "待整改",
  rectifying: "整改中",
  reviewing: "待复核",
  closed: "已关闭",
};

export default async function HazardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const hazard = data.hazards.find((item) => item.id === id);
  if (!hazard) return <MissingHazard id={id} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href="/review">
          <Button type="button" variant="secondary" className="gap-2">
            <ArrowLeft className="size-4" />
            返回审核中心
          </Button>
        </Link>
        <Link href="/safety">
          <Button type="button" variant="ghost">返回安全列表</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{hazard.title}</CardTitle>
            <CardDescription>
              {hazard.area} / 责任人 {hazard.owner} / 截止 {hazard.dueDate} / 状态 {statusLabel[hazard.status]}
            </CardDescription>
          </div>
          <RiskBadge level={hazard.riskLevel} />
        </CardHeader>
        <p className="text-sm leading-7 text-slate-200">整改要求：清理风险区域，补齐防护设施，上传整改前后对比照片后发起复查。</p>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>整改闭环</CardTitle>
            <CardDescription>通知、回复、复查、关闭。</CardDescription>
          </div>
        </CardHeader>
        <RectificationFlow />
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>审核操作</CardTitle>
            <CardDescription>{hazard.status === "closed" ? "该隐患已完成审核销项。" : "确认隐患整改资料后处理审核结果。"}</CardDescription>
          </div>
        </CardHeader>
        {hazard.status === "closed" ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-100">该记录已销项，无需重复审核。</div>
        ) : (
          <ReviewFlow targetType="safety" targetId={hazard.id} />
        )}
      </Card>
    </div>
  );
}

function MissingHazard({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>隐患记录不存在或已被删除</CardTitle>
            <CardDescription>记录编号：{id}</CardDescription>
          </div>
        </CardHeader>
        <p className="text-sm leading-7 text-muted">这条隐患可能已经被删除、销项清理，或不属于当前项目。请返回安全列表查看当前项目仍有效的隐患记录。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety">
            <Button type="button">返回安全列表</Button>
          </Link>
          <Link href="/review">
            <Button type="button" variant="secondary">返回审核中心</Button>
          </Link>
          <Link href="/dashboard">
            <Button type="button" variant="ghost">返回首页</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

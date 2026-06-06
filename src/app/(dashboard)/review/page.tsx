import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewFlow } from "@/components/shared/review-flow";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";
import { MODULE_LABELS } from "@/lib/constants";
import { getReviewTargetHref } from "@/lib/review-links";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const data = await readAppData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand">审核中心</p>
        <h1 className="mt-2 text-3xl font-black text-white">审核中心</h1>
        <p className="mt-2 text-muted">项目经理专属入口，统一处理日志、材料、机械、安全、档案、变更签证等待审事项。</p>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>待审记录</CardTitle>
            <CardDescription>点击记录可进入详情，完成查看后可返回审核中心继续处理。</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {data.reviewItems.map((item) => {
            const detailHref = getReviewTargetHref(item.targetType, item.id);
            return (
              <div key={`${item.targetType}-${item.id}`} className="grid gap-3 rounded-2xl border border-border bg-panel/60 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <Link href={detailHref} className="block rounded-xl outline-none transition hover:text-brand focus-visible:ring-2 focus-visible:ring-brand">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {MODULE_LABELS[item.targetType]} / {item.submittedBy} / {item.submittedAt}
                  </p>
                </Link>
                <StatusBadge status={item.status} />
                <div className="flex flex-wrap gap-2">
                  <Link href={detailHref}>
                    <Button type="button" variant="secondary" className="gap-2">
                      查看详情
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <ReviewFlow targetType={item.targetType} targetId={item.id} />
                </div>
              </div>
            );
          })}
          {data.reviewItems.length === 0 && <p className="text-sm text-muted">暂无待审记录。</p>}
        </div>
      </Card>
    </div>
  );
}

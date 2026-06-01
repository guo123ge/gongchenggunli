import { ReviewFlow } from "@/components/shared/review-flow";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULE_LABELS } from "@/lib/constants";
import { readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const data = await readStore();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-brand">Review Center</p>
        <h1 className="mt-2 text-3xl font-black text-white">审核中心</h1>
        <p className="mt-2 text-muted">PM 专属入口，统一处理日志、材料、机械、安全、档案、变更签证。</p>
      </div>
      <Card>
        <CardHeader><div><CardTitle>待审记录</CardTitle><CardDescription>按模块聚合，支持通过、驳回、退回修改。</CardDescription></div></CardHeader>
        <div className="space-y-3">
          {data.reviewItems.map((item) => (
            <div key={`${item.targetType}-${item.id}`} className="grid gap-3 rounded-2xl border border-border bg-panel/60 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-muted">{MODULE_LABELS[item.targetType]} · {item.submittedBy} · {item.submittedAt}</p>
              </div>
              <StatusBadge status={item.status} />
              <ReviewFlow targetType={item.targetType} targetId={item.id} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

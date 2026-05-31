import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MODULE_LABELS } from "@/lib/constants";
import type { ReviewItem } from "@/types";

export function PendingReview({ items }: { items: ReviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>待审批列表</CardTitle>
          <CardDescription>统一审核流：提交、通过、驳回、退回修改</CardDescription>
        </div>
        <Link href="/review" className="text-sm font-semibold text-brand">
          进入审核中心
        </Link>
      </CardHeader>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-panel/60 p-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted">
                {MODULE_LABELS[item.targetType]} · {item.submittedBy} · {item.submittedAt}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}


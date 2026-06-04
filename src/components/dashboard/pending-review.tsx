import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MODULE_LABELS } from "@/lib/constants";
import { getReviewTargetHref } from "@/lib/review-links";
import type { ReviewItem } from "@/types";

export function PendingReview({ items }: { items: ReviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>待审核记录</CardTitle>
          <CardDescription>点击记录可进入对应业务详情，审核中心保留统一处理入口。</CardDescription>
        </div>
        <Link href="/review" className="text-sm font-semibold text-brand">
          进入审核中心
        </Link>
      </CardHeader>
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={`${item.targetType}-${item.id}`}
            href={getReviewTargetHref(item.targetType, item.id)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-panel/60 p-3 transition hover:border-brand/60"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted">
                {MODULE_LABELS[item.targetType]} / {item.submittedBy} / {item.submittedAt}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </Link>
        ))}
      </div>
    </Card>
  );
}

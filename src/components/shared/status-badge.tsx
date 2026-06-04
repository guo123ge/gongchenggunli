import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/types/enums";

const label: Record<ReviewStatus, string> = {
  draft: "草稿",
  submitted: "待审核",
  approved: "已通过",
  rejected: "已驳回",
};

const tone: Record<ReviewStatus, string> = {
  draft: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  submitted: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  rejected: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

export function StatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tone[status], className)}>
      {label[status]}
    </span>
  );
}

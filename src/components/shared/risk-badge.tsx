import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/enums";

const label: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  critical: "重大风险",
};

const tone: Record<RiskLevel, string> = {
  low: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  medium: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
  high: "border-orange-400/40 bg-orange-400/10 text-orange-100",
  critical: "border-rose-400/40 bg-rose-400/10 text-rose-100",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", tone[level])}>{label[level]}</span>;
}


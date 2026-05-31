import { AlertTriangle, ClipboardCheck, PackageMinus, TimerReset, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/types";

const cards = [
  { key: "pendingReviews", label: "待审核", icon: ClipboardCheck, tone: "text-sky-200" },
  { key: "overdueItems", label: "逾期事项", icon: TimerReset, tone: "text-rose-200" },
  { key: "safetyHazards", label: "安全隐患", icon: AlertTriangle, tone: "text-orange-200" },
  { key: "lowStockMaterials", label: "低库存", icon: PackageMinus, tone: "text-yellow-100" },
  { key: "maintenanceDue", label: "保养到期", icon: Wrench, tone: "text-emerald-200" },
] as const;

export function StatCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <Card key={key} className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-24 rounded-full bg-brand/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-3xl font-black text-white">{summary[key]}</p>
            </div>
            <Icon className={`size-7 ${tone}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}


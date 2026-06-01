import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/shared/risk-badge";
import { RectificationFlow } from "@/components/safety/rectification-flow";
import { Checklist } from "@/components/safety/checklist";
import { Heatmap } from "@/components/safety/heatmap";
import { readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function SafetyPage() {
  const data = await readStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand">Safety</p>
          <h1 className="mt-2 text-3xl font-black text-white">安全管理</h1>
          <p className="mt-2 text-muted">隐患上报、整改闭环、JGJ59 检查表和风险热力图。</p>
        </div>
        <Link href="/safety/hazards/new"><Button>上报隐患</Button></Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader><div><CardTitle>隐患列表</CardTitle><CardDescription>按红/橙/黄风险标识展示</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {data.hazards.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-panel/60 p-4">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">{item.area} · {item.owner} · {item.dueDate}</p>
                </div>
                <RiskBadge level={item.riskLevel} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>整改流</CardTitle><CardDescription>通知下发、回复、复查和关闭</CardDescription></div></CardHeader>
          <RectificationFlow />
        </Card>
        <Card>
          <CardHeader><div><CardTitle>JGJ59 检查表</CardTitle><CardDescription>高频检查项模板</CardDescription></div></CardHeader>
          <Checklist />
        </Card>
        <Card>
          <CardHeader><div><CardTitle>风险热力图</CardTitle><CardDescription>按施工区域聚合隐患</CardDescription></div></CardHeader>
          <Heatmap />
        </Card>
      </div>
    </div>
  );
}

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>安全事件详情 #{id}</CardTitle>
          <CardDescription>事件经过、处置记录、复盘结论和附件归档。</CardDescription>
        </div>
      </CardHeader>
      <p className="text-sm leading-7 text-slate-200">当前为事件详情骨架，后续接入 Prisma 后展示真实事件链路。</p>
    </Card>
  );
}


import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceForm } from "@/components/machinery/maintenance-form";
import { ShiftForm } from "@/components/machinery/shift-form";
import { readAppData } from "@/lib/app-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MachineryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.machinery.find((machine) => machine.id === id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>{item.code} · 操作手 {item.operator} · 下次保养 {item.nextMaintenanceDate}</CardDescription>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">{item.status}</span>
        </CardHeader>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><div><CardTitle>保养记录</CardTitle><CardDescription>维修、保养费用与处理人</CardDescription></div></CardHeader><MaintenanceForm /></Card>
        <Card><CardHeader><div><CardTitle>台班记录</CardTitle><CardDescription>作业日期、时长与工作内容</CardDescription></div></CardHeader><ShiftForm /></Card>
      </div>
    </div>
  );
}

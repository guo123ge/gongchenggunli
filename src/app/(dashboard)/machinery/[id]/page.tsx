import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MaintenanceForm } from "@/components/machinery/maintenance-form";
import { ShiftForm } from "@/components/machinery/shift-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function MachineryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const item = data.machinery.find((machine) => machine.id === id);
  if (!item) notFound();

  const maintenanceRecords = data.maintenanceRecords.filter((record) => record.machineryId === id);
  const shiftRecords = data.shiftRecords.filter((record) => record.machineryId === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href="/review">
          <Button type="button" variant="secondary" className="gap-2">
            <ArrowLeft className="size-4" />
            返回审核中心
          </Button>
        </Link>
        <Link href="/machinery">
          <Button type="button" variant="ghost">返回机械列表</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>
              {item.code} / 操作手 {item.operator} / 下次保养 {item.nextMaintenanceDate || "未安排"}
            </CardDescription>
          </div>
          <StatusBadge status={item.status} />
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>保养记录</CardTitle>
              <CardDescription>记录保养内容、费用、处理人和时间。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {maintenanceRecords.length === 0 && <p className="text-sm text-muted">暂无保养记录。</p>}
            {maintenanceRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-panel/60 p-4">
                <p className="font-semibold text-white">{record.content}</p>
                <p className="mt-1 text-xs text-muted">
                  {record.handledBy} / {record.createdAt} / 费用 {record.cost}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <MaintenanceForm machineryId={item.id} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>台班记录</CardTitle>
              <CardDescription>记录作业日期、时长和作业内容。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {shiftRecords.length === 0 && <p className="text-sm text-muted">暂无台班记录。</p>}
            {shiftRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-panel/60 p-4">
                <p className="font-semibold text-white">{record.workContent}</p>
                <p className="mt-1 text-xs text-muted">
                  {record.workDate} / {record.shiftHours} 小时 / {record.submittedBy}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <ShiftForm machineryId={item.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}

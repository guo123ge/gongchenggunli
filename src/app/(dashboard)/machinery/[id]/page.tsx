import { MaintenanceForm } from "@/components/machinery/maintenance-form";
import { ShiftForm } from "@/components/machinery/shift-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";
import { notFound } from "next/navigation";

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
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>
              {item.code} / operator {item.operator} / next maintenance {item.nextMaintenanceDate || "Not scheduled"}
            </CardDescription>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">{item.status}</span>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Maintenance records</CardTitle>
              <CardDescription>Saved maintenance content, cost, handler, and time.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {maintenanceRecords.length === 0 && <p className="text-sm text-muted">No maintenance records yet.</p>}
            {maintenanceRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-panel/60 p-4">
                <p className="font-semibold text-white">{record.content}</p>
                <p className="mt-1 text-xs text-muted">
                  {record.handledBy} / {record.createdAt} / cost {record.cost}
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
              <CardTitle>Shift records</CardTitle>
              <CardDescription>Work date, shift hours, and work content.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {shiftRecords.length === 0 && <p className="text-sm text-muted">No shift records yet.</p>}
            {shiftRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-panel/60 p-4">
                <p className="font-semibold text-white">{record.workContent}</p>
                <p className="mt-1 text-xs text-muted">
                  {record.workDate} / {record.shiftHours}h / {record.submittedBy}
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

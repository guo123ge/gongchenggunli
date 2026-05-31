import { Input, Label, Textarea } from "@/components/ui/input";

export function MaintenanceForm() {
  return (
    <div className="grid gap-3">
      <div><Label>保养内容</Label><Textarea defaultValue="检查钢丝绳、限位器、回转机构润滑。" /></div>
      <div><Label>费用</Label><Input type="number" defaultValue="1200" /></div>
    </div>
  );
}


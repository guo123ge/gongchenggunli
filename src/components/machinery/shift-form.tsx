import { Input, Label, Textarea } from "@/components/ui/input";

export function ShiftForm() {
  return (
    <div className="grid gap-3">
      <div><Label>台班小时</Label><Input type="number" defaultValue="8" /></div>
      <div><Label>作业内容</Label><Textarea defaultValue="配合地下室材料吊运。" /></div>
    </div>
  );
}


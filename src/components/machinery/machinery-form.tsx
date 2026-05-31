import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export function MachineryForm() {
  return (
    <Card>
      <CardHeader><div><CardTitle>机械进场登记</CardTitle><CardDescription>设备档案、操作手、证件和保养计划。</CardDescription></div></CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>设备名称</Label><Input defaultValue="塔吊 2#" /></div>
        <div><Label>设备编号</Label><Input defaultValue="TC6015-02" /></div>
        <div><Label>操作手</Label><Input defaultValue="李师傅" /></div>
        <div><Label>下次保养</Label><Input type="date" defaultValue="2026-06-15" /></div>
      </div>
      <div className="mt-6 flex justify-end"><Button>提交登记</Button></div>
    </Card>
  );
}


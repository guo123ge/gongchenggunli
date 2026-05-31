import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export function IncidentForm() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>安全事件登记</CardTitle>
          <CardDescription>事件等级、经过、处置措施和复盘结论。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>事件标题</Label><Input defaultValue="材料吊运险情" /></div>
        <div><Label>事件等级</Label><Input defaultValue="一般" /></div>
        <div className="md:col-span-2"><Label>事件经过</Label><Textarea /></div>
      </div>
      <div className="mt-6 flex justify-end"><Button>提交事件</Button></div>
    </Card>
  );
}


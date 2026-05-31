import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ChangeForm() {
  return (
    <Card>
      <CardHeader><div><CardTitle>设计变更</CardTitle><CardDescription>变更原因、影响评估、费用估算和附件。</CardDescription></div></CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>变更标题</Label><Input defaultValue="地下室集水坑位置调整" /></div>
        <div><Label>估算费用</Label><Input type="number" defaultValue="18600" /></div>
        <div className="md:col-span-2"><Label>变更内容</Label><Textarea /></div>
      </div>
      <div className="mt-6 flex justify-end"><Button>提交变更</Button></div>
    </Card>
  );
}


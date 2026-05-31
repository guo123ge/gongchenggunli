import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";

export function HazardForm() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>新建安全隐患</CardTitle>
            <CardDescription>隐患描述、风险等级、整改期限、责任人和现场照片。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>隐患标题</Label>
            <Input defaultValue="楼层临边防护缺失" />
          </div>
          <div>
            <Label>风险等级</Label>
            <Input defaultValue="high" />
          </div>
          <div>
            <Label>区域</Label>
            <Input defaultValue="塔楼 A 8 层" />
          </div>
          <div>
            <Label>整改截止日期</Label>
            <Input type="date" defaultValue="2026-06-02" />
          </div>
          <div className="md:col-span-2">
            <Label>隐患描述</Label>
            <Textarea defaultValue="楼梯间临边踢脚板缺失，需立即补齐并复查。" />
          </div>
        </div>
      </Card>
      <ImageUpload />
      <div className="flex justify-end"><Button>提交整改流</Button></div>
    </div>
  );
}


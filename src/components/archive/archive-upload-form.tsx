import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";

export function ArchiveUploadForm() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><div><CardTitle>档案上传</CardTitle><CardDescription>资料分类、标签、版本和归档完整性检查。</CardDescription></div></CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>档案标题</Label><Input defaultValue="钢筋原材复试报告" /></div>
          <div><Label>分类</Label><Input defaultValue="试验资料" /></div>
          <div><Label>标签</Label><Input defaultValue="钢筋,复试,主体结构" /></div>
          <div><Label>版本</Label><Input defaultValue="v1.0" /></div>
        </div>
      </Card>
      <ImageUpload />
      <div className="flex justify-end"><Button>上传并提交</Button></div>
    </div>
  );
}


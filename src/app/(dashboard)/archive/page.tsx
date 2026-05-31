import Link from "next/link";
import { ArchiveChecker } from "@/components/archive/archive-checker";
import { FilePreview } from "@/components/archive/file-preview";
import { VersionList } from "@/components/archive/version-list";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArchivePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-3xl font-black text-white">档案管理</h1><p className="mt-2 text-muted">分类、全文搜索、版本历史和在线预览。</p></div>
        <Link href="/archive/new"><Button>上传档案</Button></Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><div><CardTitle>档案预览</CardTitle><CardDescription>PDF/图片在线查看</CardDescription></div></CardHeader><FilePreview /></Card>
        <Card><CardHeader><div><CardTitle>版本历史</CardTitle><CardDescription>保留所有归档版本</CardDescription></div></CardHeader><VersionList /></Card>
      </div>
      <ArchiveChecker />
    </div>
  );
}


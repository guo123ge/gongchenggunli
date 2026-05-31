import { ArchiveChecker } from "@/components/archive/archive-checker";
import { ArchiveDetail } from "@/components/archive/archive-detail";
import { FilePreview } from "@/components/archive/file-preview";
import { VersionList } from "@/components/archive/version-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ArchiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <Card><CardHeader><div><CardTitle>档案详情 #{id}</CardTitle><CardDescription>附件预览、版本历史和归档完整性。</CardDescription></div></CardHeader><ArchiveDetail /></Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><div><CardTitle>文件预览</CardTitle><CardDescription>PDF/图片/DWG 下载提示</CardDescription></div></CardHeader><FilePreview /></Card>
        <Card><CardHeader><div><CardTitle>版本</CardTitle><CardDescription>历史版本可追溯</CardDescription></div></CardHeader><VersionList /></Card>
      </div>
      <ArchiveChecker />
    </div>
  );
}


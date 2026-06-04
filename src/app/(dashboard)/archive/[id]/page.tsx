import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArchiveChecker } from "@/components/archive/archive-checker";
import { ArchiveDetail } from "@/components/archive/archive-detail";
import { FilePreview } from "@/components/archive/file-preview";
import { VersionList } from "@/components/archive/version-list";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function ArchiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const archive = data.archives.find((item) => item.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link href="/review">
          <Button variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回审核中心
          </Button>
        </Link>
        <Link href="/archive">
          <Button variant="ghost">返回档案列表</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{archive?.title ?? `档案详情 #${id}`}</CardTitle>
            <CardDescription>查看附件预览、版本历史、审核意见和归档完整性。</CardDescription>
          </div>
        </CardHeader>
        <ArchiveDetail archive={archive} />
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>文件预览</CardTitle>
              <CardDescription>支持文档、图片预览与图纸下载提示。</CardDescription>
            </div>
          </CardHeader>
          <FilePreview />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>版本历史</CardTitle>
              <CardDescription>历史版本可追溯。</CardDescription>
            </div>
          </CardHeader>
          <VersionList />
        </Card>
      </div>
      <ArchiveChecker />
    </div>
  );
}

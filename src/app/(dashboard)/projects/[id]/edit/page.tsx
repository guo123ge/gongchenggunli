import Link from "next/link";
import { ProjectForm } from "@/components/project/project-form";
import { Button } from "@/components/ui/button";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const project = data.projects.find((item) => item.id === id);

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-panel/70 p-6">
          <h1 className="text-2xl font-black text-white">项目不存在或已被删除</h1>
          <p className="mt-2 text-sm text-muted">请返回项目列表查看当前可管理的项目。</p>
          <Link href="/projects" className="mt-5 inline-block">
            <Button>返回项目列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ProjectForm mode="edit" project={project} />;
}

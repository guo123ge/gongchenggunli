import Link from "next/link";
import { ProjectActions } from "@/components/project/project-actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

const statusLabel = {
  preparation: "筹备中",
  in_progress: "施工中",
  suspended: "已停工",
  completed: "已完工",
};

export default async function ProjectsPage() {
  const data = await readAppData();
  const projects = data.projects ?? [data.project];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-brand">项目管理</p>
          <h1 className="mt-2 text-3xl font-black text-white">项目列表</h1>
          <p className="mt-2 text-muted">管理施工项目基础信息，新建项目后会自动设为当前项目，业务数据按当前项目独立显示。</p>
        </div>
        <Link href="/projects/new">
          <Button>新建项目</Button>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.code} / {statusLabel[project.status]}
                </CardDescription>
              </div>
              <ProjectActions projectId={project.id} projectName={project.name} isActive={project.id === data.project.id} canDelete={projects.length > 1} />
            </CardHeader>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">项目地址</p>
                <p className="mt-1 font-semibold text-white">{project.location}</p>
              </div>
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">建设单位</p>
                <p className="mt-1 font-semibold text-white">{project.owner}</p>
              </div>
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">施工单位</p>
                <p className="mt-1 font-semibold text-white">{project.contractor}</p>
              </div>
              <div className="rounded-2xl bg-panel-soft p-3">
                <p className="text-muted">计划工期</p>
                <p className="mt-1 font-semibold text-white">
                  {project.startDate} 至 {project.plannedEndDate}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

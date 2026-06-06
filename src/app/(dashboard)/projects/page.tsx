import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { ProjectActions } from "@/components/project/project-actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { readAppData } from "@/lib/app-data";
import type { ProjectRole } from "@/types/enums";

export const dynamic = "force-dynamic";

const statusLabel = {
  preparation: "筹备中",
  in_progress: "施工中",
  suspended: "已停工",
  completed: "已完工",
};

export default async function ProjectsPage() {
  const [session, data] = await Promise.all([auth(), readAppData()]);
  const currentRole = (session?.user?.role ?? "CON") as ProjectRole;
  const projects = data.projects ?? [data.project];
  const pendingReviewCount = data.reviewItems.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-brand">项目管理</p>
          <h1 className="mt-2 text-3xl font-black text-white">项目列表</h1>
          <p className="mt-2 text-muted">管理施工项目基础信息，新建项目后会自动设为当前项目，业务数据按当前项目独立显示。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {currentRole === "PM" && (
            <Link href="/review">
              <Button variant="secondary" className="gap-2">
                <ClipboardCheck className="size-4" />
                进入审核中心{pendingReviewCount > 0 ? `（${pendingReviewCount}）` : ""}
              </Button>
            </Link>
          )}
          <Link href="/projects/new">
            <Button>新建项目</Button>
          </Link>
        </div>
      </div>

      {currentRole === "PM" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>项目经理审核入口</CardTitle>
              <CardDescription>当前项目共有 {pendingReviewCount} 条待审记录。点击右侧按钮可进入审核中心，统一处理日志、材料、安全、机械、档案、变更签证等待审事项。</CardDescription>
            </div>
            <Link href="/review">
              <Button type="button" className="gap-2">
                <ClipboardCheck className="size-4" />
                进入审核中心
              </Button>
            </Link>
          </CardHeader>
        </Card>
      )}

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
              <Info label="项目地址" value={project.location} />
              <Info label="建设单位" value={project.owner} />
              <Info label="施工单位" value={project.contractor} />
              <Info label="计划工期" value={`${project.startDate} 至 ${project.plannedEndDate}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-panel-soft p-3">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

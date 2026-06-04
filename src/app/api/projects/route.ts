import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { updateStore } from "@/lib/server-store";
import type { Project } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.projects ?? [data.project] });
}

export async function POST(request: Request) {
  if (isPrismaBackendEnabled()) {
    return NextResponse.json({ ok: false, error: "正式数据库项目创建接口尚未启用，请先使用本地数据后端或补充 Prisma 写入逻辑。" }, { status: 501 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const code = String(body.code ?? "").trim();
  const location = String(body.location ?? "").trim();
  const owner = String(body.owner ?? "").trim();
  const contractor = String(body.contractor ?? "").trim();
  const supervisor = String(body.supervisor ?? "").trim();
  const startDate = String(body.startDate ?? "").trim();
  const plannedEndDate = String(body.plannedEndDate ?? "").trim();
  const status = String(body.status ?? "preparation") as Project["status"];

  if (!name || !code || !location || !owner || !contractor || !startDate || !plannedEndDate) {
    return NextResponse.json({ ok: false, error: "项目名称、编号、地点、建设单位、施工单位、开工日期和计划完工日期不能为空。" }, { status: 422 });
  }

  const created = await updateStore((data) => {
    data.projects ??= [data.project];
    if (data.projects.some((item) => item.code === code)) {
      throw new Error("项目编号已存在，请更换编号。");
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      code,
      location,
      owner,
      contractor,
      supervisor: supervisor || undefined,
      status,
      startDate,
      plannedEndDate,
    };

    data.projects.unshift(project);
    data.project = project;
    return project;
  }).catch((error) => {
    throw error instanceof Error ? error : new Error("项目创建失败。");
  });

  return NextResponse.json({ ok: true, data: created });
}

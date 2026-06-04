import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { updateStore } from "@/lib/server-store";
import type { Project } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isPrismaBackendEnabled()) {
    return NextResponse.json({ ok: false, error: "正式数据库项目更新接口尚未启用，请先在本地数据后端验证。" }, { status: 501 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.intent === "update") return updateProject(id, body);
  return selectProject(id);
}

async function selectProject(id: string) {
  const selected = await updateStore((data) => {
    data.projects ??= [data.project];
    const target = data.projects.find((item) => item.id === id);
    if (!target) throw new Error("未找到要切换的项目。");
    data.project = target;
    return target;
  });

  return NextResponse.json({ ok: true, data: selected });
}

async function updateProject(id: string, body: Record<string, unknown>) {
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
    return NextResponse.json({ ok: false, error: "项目名称、编号、地址、建设单位、施工单位、开工日期和计划完工日期不能为空。" }, { status: 422 });
  }

  const updated = await updateStore((data) => {
    data.projects ??= [data.project];
    if (data.projects.some((item) => item.id !== id && item.code === code)) {
      throw new Error("项目编号已存在，请更换编号。");
    }

    const index = data.projects.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("未找到要修改的项目。");

    const project: Project = {
      ...data.projects[index],
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

    data.projects[index] = project;
    if (data.project.id === id) data.project = project;
    return project;
  });

  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isPrismaBackendEnabled()) {
    return NextResponse.json({ ok: false, error: "正式数据库项目删除接口尚未启用，请先在本地数据后端验证。" }, { status: 501 });
  }

  const { id } = await params;
  const deleted = await updateStore((data) => {
    data.projects ??= [data.project];
    if (data.projects.length <= 1) {
      throw new Error("至少需要保留一个项目，不能删除最后一个项目。");
    }

    const target = data.projects.find((item) => item.id === id);
    if (!target) throw new Error("未找到要删除的项目。");

    const dailyLogIds = new Set(data.dailyLogs.filter((item) => item.projectId === id).map((item) => item.id));
    const materialIds = new Set(data.materials.filter((item) => item.projectId === id).map((item) => item.id));
    const stockIds = new Set([...data.stockIns, ...data.stockOuts].filter((item) => materialIds.has(item.materialId)).map((item) => item.id));
    const hazardIds = new Set(data.hazards.filter((item) => item.projectId === id).map((item) => item.id));
    const incidentIds = new Set(data.incidents.filter((item) => item.projectId === id).map((item) => item.id));
    const machineryIds = new Set(data.machinery.filter((item) => item.projectId === id).map((item) => item.id));
    const archiveIds = new Set(data.archives.filter((item) => item.projectId === id).map((item) => item.id));
    const changeIds = new Set(data.changes.filter((item) => item.projectId === id).map((item) => item.id));
    const visaIds = new Set(data.visas.filter((item) => item.projectId === id).map((item) => item.id));

    data.projects = data.projects.filter((item) => item.id !== id);
    data.dailyLogs = data.dailyLogs.filter((item) => item.projectId !== id);
    data.materials = data.materials.filter((item) => item.projectId !== id);
    data.stockIns = data.stockIns.filter((item) => !materialIds.has(item.materialId));
    data.stockOuts = data.stockOuts.filter((item) => !materialIds.has(item.materialId));
    data.hazards = data.hazards.filter((item) => item.projectId !== id);
    data.incidents = data.incidents.filter((item) => item.projectId !== id);
    data.machinery = data.machinery.filter((item) => item.projectId !== id);
    data.maintenanceRecords = data.maintenanceRecords.filter((item) => !machineryIds.has(item.machineryId));
    data.shiftRecords = data.shiftRecords.filter((item) => !machineryIds.has(item.machineryId));
    data.archives = data.archives.filter((item) => item.projectId !== id);
    data.archiveFiles = data.archiveFiles.filter((item) => !archiveIds.has(item.archiveId));
    data.documents = data.documents.filter((item) => item.projectId !== id);
    data.changes = data.changes.filter((item) => item.projectId !== id);
    data.visas = data.visas.filter((item) => item.projectId !== id);
    data.reviewItems = data.reviewItems.filter((item) => {
      if (item.targetType === "daily-log") return !dailyLogIds.has(item.id);
      if (item.targetType === "material") return !materialIds.has(item.id) && !stockIds.has(item.id);
      if (item.targetType === "safety") return !hazardIds.has(item.id) && !incidentIds.has(item.id);
      if (item.targetType === "machinery") return !machineryIds.has(item.id);
      if (item.targetType === "archive") return !archiveIds.has(item.id);
      if (item.targetType === "change-visa") return !changeIds.has(item.id) && !visaIds.has(item.id);
      return true;
    });

    if (data.project.id === id) {
      data.project = data.projects[0];
    }

    return target;
  });

  return NextResponse.json({ ok: true, data: deleted });
}

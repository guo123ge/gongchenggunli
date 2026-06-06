import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readAppData } from "@/lib/app-data";
import { addReviewItem, updateStore } from "@/lib/server-store";
import type { DocumentRecord } from "@/types";
import type { ModuleKey, ProjectRole } from "@/types/enums";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readAppData();
  return NextResponse.json({ ok: true, data: data.documents });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, cleanText(body.fileName, "未命名资料"));
  const fileName = cleanText(body.fileName, title);
  const url = cleanText(body.url, "");
  const moduleKey = cleanModule(body.module);

  if (!url) {
    return NextResponse.json({ ok: false, error: "资料文件地址不能为空。" }, { status: 422 });
  }

  const created = await updateStore((data) => {
    const submittedBy = session?.user?.name ?? cleanText(body.submittedBy, "当前用户");
    const record: DocumentRecord = {
      id: crypto.randomUUID(),
      projectId: data.project.id,
      module: moduleKey,
      title,
      fileName,
      fileType: cleanText(body.fileType, "application/octet-stream"),
      fileSize: Number(body.fileSize ?? 0),
      url,
      storageProvider: cleanProvider(body.storageProvider),
      submittedBy,
      submittedRole: ((session?.user?.role as ProjectRole | undefined) ?? cleanRole(body.submittedRole)) as ProjectRole,
      reviewStatus: "submitted",
      aiReviewStatus: "pending",
      aiSummary: cleanText(body.aiSummary, ""),
      sourceType: cleanSourceType(body.sourceType),
      visibilityRoles: cleanVisibilityRoles(body.visibilityRoles),
      accessLogs: [],
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    data.documents.unshift(record);
    addReviewItem(data, {
      id: record.id,
      targetType: "documents",
      title: `资料待审核：${record.title}`,
      submittedBy,
      submittedAt: record.createdAt,
      status: "submitted",
      priority: "normal",
    });
    return record;
  });

  return NextResponse.json({ ok: true, data: created });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = cleanText(body.id, "");
  if (!id) return NextResponse.json({ ok: false, error: "资料记录编号不能为空。" }, { status: 422 });

  const updated = await updateStore((data) => {
    const index = data.documents.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.documents[index] = {
      ...data.documents[index],
      aiReviewStatus: cleanAiStatus(body.aiReviewStatus),
      aiSummary: cleanText(body.aiSummary, data.documents[index].aiSummary ?? ""),
    };
    return data.documents[index];
  });

  if (!updated) return NextResponse.json({ ok: false, error: "未找到要更新的资料记录。" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "PM") {
    return NextResponse.json({ ok: false, error: "只有项目经理可以删除资料。" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = cleanText(searchParams.get("id"), "");
  if (!id) return NextResponse.json({ ok: false, error: "资料记录编号不能为空。" }, { status: 422 });

  const deleted = await updateStore((data) => {
    const target = data.documents.find((item) => item.id === id && item.projectId === data.project.id);
    if (!target) return null;
    data.documents = data.documents.filter((item) => item.id !== id);
    data.reviewItems = data.reviewItems.filter((item) => !(item.id === id && item.targetType === "documents"));
    return target;
  });

  if (!deleted) return NextResponse.json({ ok: false, error: "未找到要删除的资料记录。" }, { status: 404 });
  return NextResponse.json({ ok: true, data: deleted });
}

function cleanText(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanModule(value: unknown): ModuleKey {
  const text = String(value ?? "");
  const modules: ModuleKey[] = ["documents", "daily-log", "quantity", "material", "machinery", "safety", "archive", "change-visa", "review", "project", "dashboard"];
  return modules.includes(text as ModuleKey) ? (text as ModuleKey) : "documents";
}

function cleanProvider(value: unknown): DocumentRecord["storageProvider"] {
  if (value === "tencent-cos" || value === "vercel-blob" || value === "local") return value;
  return "local";
}

function cleanRole(value: unknown): ProjectRole {
  const text = String(value ?? "");
  const roles: ProjectRole[] = ["PM", "CON", "TECH", "SAFE", "MAT", "DOC", "MACH"];
  return roles.includes(text as ProjectRole) ? (text as ProjectRole) : "CON";
}

function cleanAiStatus(value: unknown): DocumentRecord["aiReviewStatus"] {
  if (value === "pending" || value === "passed" || value === "warning" || value === "failed") return value;
  return "pending";
}

function cleanSourceType(value: unknown): DocumentRecord["sourceType"] {
  if (value === "image" || value === "audio" || value === "file") return value;
  return "file";
}

function cleanVisibilityRoles(value: unknown): ProjectRole[] {
  if (!Array.isArray(value)) return ["PM", "CON", "TECH", "SAFE", "MAT", "DOC", "MACH"];
  const roles: ProjectRole[] = ["PM", "CON", "TECH", "SAFE", "MAT", "DOC", "MACH"];
  const selected = value.map(String).filter((item): item is ProjectRole => roles.includes(item as ProjectRole));
  return selected.length > 0 ? selected : roles;
}

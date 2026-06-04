import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";
import { updateStore } from "@/lib/server-store";
import type { DocumentRecord } from "@/types";
import type { ModuleKey, ProjectRole } from "@/types/enums";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "未找到上传文件。" }, { status: 400 });
  }

  const safeOriginalName = file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
  const fileName = `${Date.now()}-${safeOriginalName}`;
  const saved = await saveUploadedFile({ file, fileName });

  const data = {
    fileName: file.name,
    filePath: saved.filePath,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    url: saved.url,
    storageProvider: saved.storageProvider,
  };

  const shouldRegister = String(formData.get("registerDocument") ?? "false") === "true";
  if (shouldRegister) {
    await updateStore((store) => {
      const record: DocumentRecord = {
        id: crypto.randomUUID(),
        projectId: store.project.id,
        module: cleanModule(formData.get("module")),
        title: cleanText(formData.get("title"), file.name),
        fileName: file.name,
        fileType: data.fileType,
        fileSize: data.fileSize,
        url: saved.url,
        storageProvider: saved.storageProvider,
        submittedBy: session?.user?.name ?? "当前用户",
        submittedRole: ((session?.user?.role as ProjectRole | undefined) ?? "CON") as ProjectRole,
        reviewStatus: "submitted",
        aiReviewStatus: "pending",
        sourceType: inferSourceType(file.type),
        visibilityRoles: ["PM", "CON", "TECH", "SAFE", "MAT", "DOC", "MACH"],
        accessLogs: [],
        createdAt: new Date().toLocaleString("zh-CN"),
      };
      store.documents.unshift(record);
    });
  }

  return NextResponse.json({ ok: true, data });
}

function cleanText(value: FormDataEntryValue | null, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanModule(value: FormDataEntryValue | null): ModuleKey {
  const text = String(value ?? "");
  const modules: ModuleKey[] = ["documents", "daily-log", "material", "machinery", "safety", "archive", "change-visa", "review", "project", "dashboard"];
  return modules.includes(text as ModuleKey) ? (text as ModuleKey) : "documents";
}

function inferSourceType(fileType: string) {
  if (fileType.startsWith("image/")) return "image" as const;
  if (fileType.startsWith("audio/")) return "audio" as const;
  return "file" as const;
}

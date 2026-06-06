"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { ModuleKey } from "@/types/enums";

const moduleOptions: Array<{ value: ModuleKey; label: string }> = [
  { value: "documents", label: "通用资料" },
  { value: "daily-log", label: "施工日志" },
  { value: "quantity", label: "工程量" },
  { value: "material", label: "材料管理" },
  { value: "safety", label: "安全管理" },
  { value: "machinery", label: "机械管理" },
  { value: "archive", label: "档案管理" },
  { value: "change-visa", label: "变更签证" },
];

export function DocumentUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [module, setModule] = useState<ModuleKey>("documents");
  const [isPending, startTransition] = useTransition();

  async function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title.trim() || file.name);
    formData.set("module", module);
    formData.set("registerDocument", "true");

    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) {
      toast.error(String(body.error ?? "资料上传失败。"));
      return;
    }

    toast.success("资料已上传并集中归档。");
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-3xl border border-border bg-panel/70 p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-brand text-black">
          <UploadCloud className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-white">上传资料</p>
          <p className="text-xs text-muted">各角色提交的文件会集中保存到当前项目资料库。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_12rem_auto]">
        <div>
          <Label htmlFor="document-title">资料标题</Label>
          <Input id="document-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：钢筋复试报告、隐患整改照片" />
        </div>
        <div>
          <Label htmlFor="document-module">所属模块</Label>
          <select
            id="document-module"
            value={module}
            onChange={(event) => setModule(event.target.value as ModuleKey)}
            className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
          >
            {moduleOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button type="button" disabled={isPending} onClick={() => inputRef.current?.click()}>
            {isPending ? "上传中..." : "选择文件"}
          </Button>
        </div>
      </div>
    </div>
  );
}

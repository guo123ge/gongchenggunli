"use client";

import { FileUp, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Attachment, QuantityItem } from "@/types";

export function QuantityUpdateForm({ quantity }: { quantity: QuantityItem }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [form, setForm] = useState({
    completedAmount: "",
    updatedAt: new Date().toISOString().slice(0, 10),
    submittedBy: "",
    description: "",
    delayReason: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const uploaded: Attachment[] = [];
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("title", `${quantity.name}-完成量证据-${file.name}`);
        formData.set("module", "quantity");
        formData.set("registerDocument", "true");

        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.ok) throw new Error(String(body.error ?? `${file.name} 上传失败。`));
        uploaded.push({
          id: crypto.randomUUID(),
          fileName: body.data?.fileName ?? file.name,
          fileType: body.data?.fileType ?? file.type,
          url: body.data?.url ?? "",
        });
      }
      setAttachments((current) => [...current, ...uploaded]);
      toast.success("证据附件已上传并进入资料库。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "附件上传失败。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submit() {
    const response = await fetch(`/api/quantities/${quantity.id}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, completedAmount: Number(form.completedAmount), attachments }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "工程量更新失败。"));
      return;
    }
    toast.success("完成量已更新。");
    setForm({ completedAmount: "", updatedAt: new Date().toISOString().slice(0, 10), submittedBy: "", description: "", delayReason: "" });
    setAttachments([]);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>填报完成量</CardTitle>
          <CardDescription>本次完成量会自动累计到已完工程量，并重新计算剩余量、百分比和状态。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="本次完成量">
          <Input type="number" min={0} value={form.completedAmount} onChange={(event) => update("completedAmount", event.target.value)} placeholder={quantity.unit} />
        </Field>
        <Field label="更新日期">
          <Input type="date" value={form.updatedAt} onChange={(event) => update("updatedAt", event.target.value)} />
        </Field>
        <Field label="填报人">
          <Input value={form.submittedBy} onChange={(event) => update("submittedBy", event.target.value)} placeholder="例如：林施工" />
        </Field>
        <Field label="偏差原因">
          <Input value={form.delayReason} onChange={(event) => update("delayReason", event.target.value)} placeholder="例如：天气、材料、图纸、交叉作业" />
        </Field>
        <Field label="现场说明" className="md:col-span-2">
          <Textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="说明本次完成范围、计量依据和现场证据。" />
        </Field>
        <div className="md:col-span-2">
          <Label>附件/照片证据</Label>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
            onChange={(event) => {
              void uploadFiles(event.target.files);
            }}
          />
          <div className="rounded-2xl border border-dashed border-border bg-panel/60 p-4">
            <Button type="button" variant="secondary" className="gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              {uploading ? "上传中" : "上传证据附件"}
            </Button>
            <p className="mt-2 text-xs text-muted">支持现场照片、计量单、签认资料等文件，上传后会同步进入资料库并关联本次完成量记录。</p>
            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <span key={file.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-panel-soft px-3 py-1 text-xs text-slate-200">
                    {file.fileName}
                    <button type="button" className="text-muted hover:text-white" onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))} aria-label={`移除 ${file.fileName}`}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="button" onClick={submit}>
          提交完成量
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

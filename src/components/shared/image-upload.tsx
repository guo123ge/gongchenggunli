"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type { ModuleKey } from "@/types/enums";

export type UploadedImage = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string;
  base64: string;
  uploadedUrl?: string;
};

type ImageUploadProps = {
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  module?: ModuleKey;
  titlePrefix?: string;
  registerDocument?: boolean;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ onChange, maxFiles = 8, module = "documents", titlePrefix = "现场照片", registerDocument = true }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const filesRef = useRef<UploadedImage[]>([]);

  useEffect(() => {
    onChange?.(files);
    filesRef.current = files;
  }, [files, onChange]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const selected = Array.from(fileList).slice(0, Math.max(0, maxFiles - files.length));
    if (selected.length === 0) return;

    setUploading(true);
    try {
      const next = await Promise.all(
        selected.map(async (file, index) => {
          const base64 = await fileToDataUrl(file);
          const formData = new FormData();
          formData.set("file", file);
          formData.set("title", `${titlePrefix}-${Date.now()}-${index + 1}`);
          formData.set("module", module);
          formData.set("registerDocument", registerDocument ? "true" : "false");

          const response = await fetch("/api/upload", { method: "POST", body: formData });
          const body = await response.json().catch(() => ({}));
          if (!response.ok || !body.ok) {
            throw new Error(String(body.error ?? `${file.name} 上传失败`));
          }

          return {
            id: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            previewUrl: URL.createObjectURL(file),
            base64,
            uploadedUrl: body.data?.url,
          } satisfies UploadedImage;
        }),
      );

      setFiles((current) => [...current, ...next]);
      toast.success("图片已上传并登记到资料库。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel/60 p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          void handleFiles(event.target.files);
        }}
      />
      <button
        type="button"
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-4 py-8 text-center text-muted transition hover:bg-white/[0.06]"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="size-8 animate-spin text-brand" /> : <ImagePlus className="size-8 text-brand" />}
        <span className="text-sm font-medium text-slate-200">上传现场照片并集中入库</span>
        <span className="text-xs">支持多图上传，上传后自动登记到资料库</span>
      </button>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {files.map((file) => (
            <div key={file.id} className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.previewUrl} alt={file.fileName} className="h-28 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[11px] text-white">{file.fileName}</div>
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 size-8 rounded-full bg-black/60 p-0"
                onClick={() =>
                  setFiles((current) =>
                    current.filter((item) => {
                      const keep = item.id !== file.id;
                      if (!keep) URL.revokeObjectURL(item.previewUrl);
                      return keep;
                    }),
                  )
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

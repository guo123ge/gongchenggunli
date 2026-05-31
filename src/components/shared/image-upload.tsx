"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel/60 p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const next = Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file));
          setFiles((current) => [...current, ...next]);
        }}
      />
      <button
        type="button"
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-4 py-8 text-center text-muted transition hover:bg-white/[0.06]"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="size-8 text-brand" />
        <span className="text-sm font-medium text-slate-200">上传现场照片，自动叠加工地水印</span>
        <span className="text-xs">支持多图、拖拽和移动端拍照</span>
      </button>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {files.map((file) => (
            <div key={file} className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file} alt="上传预览" className="h-28 w-full object-cover" />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 size-8 rounded-full bg-black/60 p-0"
                onClick={() => setFiles((current) => current.filter((item) => item !== file))}
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


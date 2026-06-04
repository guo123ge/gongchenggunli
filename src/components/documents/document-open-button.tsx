"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentOpenButton({ id, url }: { id: string; url: string }) {
  const [isPending] = useTransition();

  async function openDocument() {
    try {
      await fetch("/api/documents/access-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "view" }),
      });
    } catch {
      toast.error("访问日志记录失败，文件仍可打开。");
    }

    window.open(url, "_blank");
  }

  return (
    <Button type="button" variant="secondary" className="h-8 gap-1 px-3 text-xs" disabled={isPending} onClick={openDocument}>
      打开
      <ExternalLink className="size-3" />
    </Button>
  );
}

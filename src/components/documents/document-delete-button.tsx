"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentDeleteButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  async function remove() {
    if (!window.confirm(`确定删除“${title}”吗？删除后该资料将从资料库中移除。`)) return;

    const response = await fetch(`/api/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "资料删除失败。"));
      return;
    }

    toast.success("资料已删除。");
    startTransition(() => window.location.reload());
  }

  return (
    <Button type="button" variant="danger" className="h-8 gap-1 px-3 text-xs" disabled={isPending} onClick={remove}>
      <Trash2 className="size-3.5" />
      {isPending ? "删除中" : "删除"}
    </Button>
  );
}

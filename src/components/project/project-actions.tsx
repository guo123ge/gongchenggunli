"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProjectActions({
  projectId,
  projectName,
  isActive,
  canDelete,
}: {
  projectId: string;
  projectName: string;
  isActive: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function refreshAfter(action: () => Promise<Response>) {
    setError("");
    const response = await action();
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      setError(String(result.error ?? "操作失败，请稍后重试。"));
      return;
    }
    startTransition(() => router.refresh());
  }

  async function handleSelect() {
    await refreshAfter(() => fetch(`/api/projects/${projectId}`, { method: "PATCH" }));
  }

  async function handleDelete() {
    if (!window.confirm(`确定删除“${projectName}”吗？该项目下的日志、材料、安全、机械、档案和待审记录也会同步删除。`)) return;
    await refreshAfter(() => fetch(`/api/projects/${projectId}`, { method: "DELETE" }));
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" disabled={isPending} onClick={() => router.push(`/projects/${projectId}/edit`)}>
          编辑信息
        </Button>
        <Button type="button" variant={isActive ? "secondary" : "primary"} disabled={isActive || isPending} onClick={handleSelect}>
          {isActive ? "当前项目" : "设为当前项目"}
        </Button>
        <Button type="button" variant="danger" disabled={!canDelete || isPending} onClick={handleDelete}>
          {isPending ? "处理中" : "删除项目"}
        </Button>
      </div>
      {error && <p className="max-w-xs text-right text-xs text-danger">{error}</p>}
    </div>
  );
}

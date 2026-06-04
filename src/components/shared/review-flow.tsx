"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type { ModuleKey } from "@/types/enums";

const actionText = {
  approve: "通过",
  return: "退回修改",
  reject: "驳回",
};

export function ReviewFlow({ targetId, targetType }: { targetId: string; targetType: ModuleKey }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<keyof typeof actionText | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  async function submit(action: keyof typeof actionText) {
    setPendingAction(action);
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, targetType, action, comment: action === "approve" ? "审核通过" : "请补充附件或说明" }),
    });
    const body = await response.json().catch(() => ({}));
    setPendingAction(null);

    if (!response.ok || !body.ok) {
      toast.error(String(body.error ?? "审核失败，请稍后重试。"));
      return;
    }

    toast.success(`${actionText[action]}完成，记录已从待审列表销项。`);
    startTransition(() => router.refresh());
  }

  const disabled = pendingAction !== null || isRefreshing;

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={disabled} onClick={() => submit("approve")}>
        {pendingAction === "approve" ? "处理中" : "通过"}
      </Button>
      <Button type="button" variant="secondary" disabled={disabled} onClick={() => submit("return")}>
        {pendingAction === "return" ? "处理中" : "退回修改"}
      </Button>
      <Button type="button" variant="danger" disabled={disabled} onClick={() => submit("reject")}>
        {pendingAction === "reject" ? "处理中" : "驳回"}
      </Button>
    </div>
  );
}

"use client";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function ReviewFlow({ targetId, targetType }: { targetId: string; targetType: string }) {
  async function submit(action: "approve" | "reject" | "return") {
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, targetType, action, comment: action === "approve" ? "审核通过" : "请补充附件或说明" }),
    });
    const body = await response.json();
    if (body.ok) toast.success(action === "approve" ? "已通过审核" : "已退回处理");
    else toast.error(body.error ?? "审核失败");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => submit("approve")}>
        通过
      </Button>
      <Button type="button" variant="secondary" onClick={() => submit("return")}>
        退回修改
      </Button>
      <Button type="button" variant="danger" onClick={() => submit("reject")}>
        驳回
      </Button>
    </div>
  );
}


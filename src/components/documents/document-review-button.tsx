"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentReviewButton({
  id,
  title,
  fileName,
  sourceType,
}: {
  id: string;
  title: string;
  fileName: string;
  sourceType?: "image" | "audio" | "file";
}) {
  const [isPending, startTransition] = useTransition();

  async function review() {
    const reviewSummary =
      sourceType === "image"
        ? `AI 已完成图片资料审查：${title}。建议核对拍摄时间、部位、现场状态与整改要求是否一致。`
        : sourceType === "audio"
          ? `AI 已完成语音资料审查：${title}。建议核对语音转写内容、时间、发言人和问题描述是否完整。`
          : `AI 已完成文件资料审查：${title}。建议核对文件名称、签章、日期、版本、项目名称和关键附件是否完整。`;

    const response = await fetch("/api/documents/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: [id],
        aiReviewStatus: sourceType === "file" ? "warning" : "passed",
        summary: `${reviewSummary} 文件：${fileName}`,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "AI 审查失败。"));
      return;
    }
    toast.success("AI 审查结果已回写到资料库。");
    startTransition(() => window.location.reload());
  }

  return (
    <Button type="button" variant="secondary" className="h-8 gap-1 px-3 text-xs" disabled={isPending} onClick={review}>
      <BrainCircuit className="size-3.5" />
      {isPending ? "审查中" : "AI 审查"}
    </Button>
  );
}

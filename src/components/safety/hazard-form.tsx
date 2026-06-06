"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AiAnalysisResult } from "@/components/ai/ai-analysis-result";
import { ImageUpload, type UploadedImage } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { RiskLevel } from "@/types/enums";

type SafetyAnalysis = {
  riskLevel: RiskLevel;
  findings: string[];
  advice: string;
  provider?: "openai" | "fallback";
};

export function HazardForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [analyzing, setAnalyzing] = useState(false);
  const [title, setTitle] = useState("临边防护缺失");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("high");
  const [area, setArea] = useState("A塔楼 8 层");
  const [dueDate, setDueDate] = useState("2026-06-02");
  const [description, setDescription] = useState("临边防护不完整，存在坠落风险，需立即整改。");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analysis, setAnalysis] = useState<SafetyAnalysis | null>(null);

  async function submit() {
    const response = await fetch("/api/safety/hazards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, riskLevel, area, dueDate, description }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "隐患提交失败。");
      return;
    }
    toast.success("隐患已提交。");
    startTransition(() => router.push(`/safety/hazards/${body.data.id}`));
  }

  async function analyzeRisk() {
    if (!images[0]?.base64) {
      toast.error("请先上传现场照片。");
      return;
    }
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/safety-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: images[0].base64 }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: SafetyAnalysis; error?: string };
      if (!response.ok || body.ok === false || !body.data) {
        throw new Error(body.error ?? "安全风险识别失败");
      }
      setAnalysis(body.data);
      setRiskLevel(body.data.riskLevel);
      toast.success(body.data.provider === "openai" ? "风险识别完成" : "已生成本地规则参考结果");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "安全风险识别失败");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>新增安全隐患</CardTitle>
            <CardDescription>填写隐患描述、风险等级、整改期限并上传现场证据，图片会自动进入资料库。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="hazard-title">隐患标题</Label>
            <Input id="hazard-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hazard-risk-level">风险等级</Label>
            <select
              id="hazard-risk-level"
              value={riskLevel}
              onChange={(event) => setRiskLevel((event.target.value as RiskLevel) || "medium")}
              className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
            >
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
              <option value="critical">重大风险</option>
            </select>
          </div>
          <div>
            <Label htmlFor="hazard-area">所属区域</Label>
            <Input id="hazard-area" value={area} onChange={(event) => setArea(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hazard-due-date">整改截止日期</Label>
            <Input id="hazard-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="hazard-description">隐患描述</Label>
            <Textarea id="hazard-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>
      </Card>
      <ImageUpload module="safety" titlePrefix="安全隐患现场照片" onChange={setImages} />
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={analyzeRisk} disabled={analyzing || images.length === 0}>
          {analyzing ? "识别中..." : "智能风险识别"}
        </Button>
      </div>
      <AiAnalysisResult result={analysis} />
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "提交中..." : "提交隐患"}
        </Button>
      </div>
    </div>
  );
}

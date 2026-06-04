"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OcrResult = {
  supplier: string;
  materialName: string;
  quantity: number;
  unit: string;
  confidence: number;
  provider?: "openai" | "fallback";
};

type OcrResultViewProps = {
  imageBase64?: string;
  onApply?: (result: OcrResult) => void;
};

export function OcrResultView({ imageBase64, onApply }: OcrResultViewProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);

  async function recognize() {
    if (!imageBase64) {
      toast.error("请先上传材料单据照片。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: OcrResult; error?: string };
      if (!response.ok || body.ok === false || !body.data) {
        throw new Error(body.error ?? "单据识别失败");
      }
      setResult(body.data);
      toast.success(body.data.provider === "openai" ? "单据识别完成" : "已使用回退识别结果");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "单据识别失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>单据识别结果</CardTitle>
          <CardDescription>上传送货单后可自动识别供应商、材料和数量，并回填到入库表单。</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={recognize} disabled={loading || !imageBase64}>
            {loading ? "识别中..." : "自动识别"}
          </Button>
          <Button type="button" onClick={() => result && onApply?.(result)} disabled={!result}>
            回填表单
          </Button>
        </div>
      </CardHeader>
      <div className="grid gap-3 text-sm md:grid-cols-4">
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">供应商</p>
          <p className="mt-1 font-semibold text-white">{result?.supplier ?? "-"}</p>
        </div>
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">材料</p>
          <p className="mt-1 font-semibold text-white">{result?.materialName ?? "-"}</p>
        </div>
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">数量</p>
          <p className="mt-1 font-semibold text-white">{result ? `${result.quantity} ${result.unit}` : "-"}</p>
        </div>
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">可信度</p>
          <p className="mt-1 font-semibold text-white">{result ? `${Math.round(result.confidence * 100)}%` : "-"}</p>
        </div>
      </div>
    </Card>
  );
}

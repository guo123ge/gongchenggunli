import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OcrResultView() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>OCR 识别结果</CardTitle>
          <CardDescription>Phase 2 接 OpenAI SDK 后自动识别供应商、材料、数量和金额。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">供应商</p>
          <p className="mt-1 font-semibold text-white">浦建商砼</p>
        </div>
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">数量</p>
          <p className="mt-1 font-semibold text-white">238 m3</p>
        </div>
        <div className="rounded-2xl bg-panel-soft p-3">
          <p className="text-muted">金额</p>
          <p className="mt-1 font-semibold text-white">待补充</p>
        </div>
      </div>
    </Card>
  );
}


"use client";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { MaterialSelector } from "@/components/material/material-selector";
import { OcrResultView } from "@/components/material/ocr-result-view";

export function StockInForm() {
  async function submit() {
    const response = await fetch("/api/materials/stock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId: "mat-001", quantity: 32, billNo: "RK-NEW" }),
    });
    const body = await response.json();
    if (body.ok) toast.success("入库单已提交审核");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>材料入库</CardTitle>
            <CardDescription>上传送货单、质保书和进场照片，OCR 自动辅助提取。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <MaterialSelector />
          <div>
            <Label>入库数量</Label>
            <Input type="number" defaultValue="32" />
          </div>
          <div>
            <Label>供应商</Label>
            <Input defaultValue="申钢物资" />
          </div>
          <div>
            <Label>批次号</Label>
            <Input defaultValue="BATCH-20260531" />
          </div>
        </div>
      </Card>
      <ImageUpload />
      <OcrResultView />
      <div className="flex justify-end">
        <Button onClick={submit}>提交审核</Button>
      </div>
    </div>
  );
}


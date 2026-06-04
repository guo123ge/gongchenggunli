"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MaterialSelector } from "@/components/material/material-selector";
import { OcrResultView } from "@/components/material/ocr-result-view";
import { ImageUpload, type UploadedImage } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export function StockInForm() {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("32");
  const [supplier, setSupplier] = useState("演示供应商");
  const [batchNo, setBatchNo] = useState("20260531批次");
  const [images, setImages] = useState<UploadedImage[]>([]);

  async function submit() {
    if (!materialId) {
      toast.error("请先选择材料。");
      return;
    }

    const response = await fetch("/api/materials/stock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, quantity: Number(quantity || 0), supplier, batchNo, billNo: "RK-NEW" }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "入库提交失败。");
      return;
    }
    toast.success("入库记录已提交审核。");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>材料入库</CardTitle>
            <CardDescription>上传送货单、质保资料和现场照片，图片会自动进入资料库，可使用单据识别辅助录入。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <MaterialSelector onSelect={setMaterialId} />
          <div>
            <Label>入库数量</Label>
            <Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </div>
          <div>
            <Label>供应商</Label>
            <Input value={supplier} onChange={(event) => setSupplier(event.target.value)} />
          </div>
          <div>
            <Label>批次号</Label>
            <Input value={batchNo} onChange={(event) => setBatchNo(event.target.value)} />
          </div>
        </div>
      </Card>
      <ImageUpload module="material" titlePrefix="材料入库单据照片" onChange={setImages} />
      <OcrResultView
        imageBase64={images[0]?.base64}
        onApply={(result) => {
          setSupplier(result.supplier);
          setQuantity(String(result.quantity));
          toast.success("单据识别结果已回填。");
        }}
      />
      <div className="flex justify-end">
        <Button onClick={submit} disabled={!materialId || Number(quantity) <= 0}>
          提交审核
        </Button>
      </div>
    </div>
  );
}

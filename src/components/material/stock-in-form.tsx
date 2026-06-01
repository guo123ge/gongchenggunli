"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { MaterialSelector } from "@/components/material/material-selector";
import { OcrResultView } from "@/components/material/ocr-result-view";

export function StockInForm() {
  const [materialId, setMaterialId] = useState("");

  async function submit() {
    if (!materialId) {
      toast.error("Please select a material first.");
      return;
    }

    const response = await fetch("/api/materials/stock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, quantity: 32, billNo: "RK-NEW" }),
    });
    const body = await response.json();
    if (body.ok) {
      toast.success("Stock-in record submitted for review.");
    } else {
      toast.error(body.error ?? "Stock-in submission failed.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Material stock-in</CardTitle>
            <CardDescription>Upload delivery notes, quality files, and site photos. OCR can assist extraction.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <MaterialSelector onSelect={setMaterialId} />
          <div>
            <Label>Stock-in quantity</Label>
            <Input type="number" defaultValue="32" />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input defaultValue="Demo supplier" />
          </div>
          <div>
            <Label>Batch no.</Label>
            <Input defaultValue="BATCH-20260531" />
          </div>
        </div>
      </Card>
      <ImageUpload />
      <OcrResultView />
      <div className="flex justify-end">
        <Button onClick={submit} disabled={!materialId}>Submit for review</Button>
      </div>
    </div>
  );
}

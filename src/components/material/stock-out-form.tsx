"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { MaterialSelector } from "@/components/material/material-selector";

export function StockOutForm() {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("420");
  const [receiver, setReceiver] = useState("防水班组");
  const [usagePosition, setUsagePosition] = useState("地下室外墙");

  async function submit() {
    if (!materialId) {
      toast.error("请先选择材料。");
      return;
    }

    const response = await fetch("/api/materials/stock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, quantity: Number(quantity || 0), billNo: "CK-NEW", receiver, usagePosition }),
    });
    const body = await response.json();
    if (body.ok) {
      toast.success("出库记录已提交审核。");
    } else {
      toast.error(body.error ?? "出库提交失败。");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>材料出库</CardTitle>
          <CardDescription>选择材料、核对库存并提交出库记录。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <MaterialSelector onSelect={setMaterialId} />
        <div>
          <Label>出库数量</Label>
          <Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <div>
          <Label>领用班组</Label>
          <Input value={receiver} onChange={(event) => setReceiver(event.target.value)} />
        </div>
        <div>
          <Label>使用部位</Label>
          <Input value={usagePosition} onChange={(event) => setUsagePosition(event.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={!materialId || Number(quantity) <= 0}>提交审核</Button>
      </div>
    </Card>
  );
}

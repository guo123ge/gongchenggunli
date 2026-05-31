"use client";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { MaterialSelector } from "@/components/material/material-selector";

export function StockOutForm() {
  async function submit() {
    const response = await fetch("/api/materials/stock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId: "mat-003", quantity: 420, billNo: "CK-NEW" }),
    });
    const body = await response.json();
    if (body.ok) toast.success("出库单已提交审核");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>材料出库</CardTitle>
          <CardDescription>选择材料时展示当前库存，提交前进行库存校验。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <MaterialSelector />
        <div>
          <Label>出库数量</Label>
          <Input type="number" defaultValue="420" />
        </div>
        <div>
          <Label>领用班组</Label>
          <Input defaultValue="防水班组" />
        </div>
        <div>
          <Label>使用部位</Label>
          <Input defaultValue="地下室外墙" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={submit}>提交审核</Button>
      </div>
    </Card>
  );
}


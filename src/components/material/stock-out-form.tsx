"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { MaterialSelector } from "@/components/material/material-selector";

export function StockOutForm() {
  const [materialId, setMaterialId] = useState("");

  async function submit() {
    if (!materialId) {
      toast.error("Please select a material first.");
      return;
    }

    const response = await fetch("/api/materials/stock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, quantity: 420, billNo: "CK-NEW" }),
    });
    const body = await response.json();
    if (body.ok) {
      toast.success("Stock-out record submitted for review.");
    } else {
      toast.error(body.error ?? "Stock-out submission failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Material stock-out</CardTitle>
          <CardDescription>Select material, check current stock, and submit a stock-out record.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <MaterialSelector onSelect={setMaterialId} />
        <div>
          <Label>Stock-out quantity</Label>
          <Input type="number" defaultValue="420" />
        </div>
        <div>
          <Label>Receiving team</Label>
          <Input defaultValue="Waterproofing team" />
        </div>
        <div>
          <Label>Usage area</Label>
          <Input defaultValue="Basement exterior wall" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={!materialId}>Submit for review</Button>
      </div>
    </Card>
  );
}

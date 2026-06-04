"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { QuantityTable } from "./quantity-table";
import { CostSummary } from "./cost-summary";

export function VisaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("夜间抢工照明台班签证");
  const [visaType, setVisaType] = useState("材料机械");
  const [totalAmount, setTotalAmount] = useState("5760");
  const [reason, setReason] = useState("夜间抢工增加照明与发电机台班。");

  async function submit() {
    const response = await fetch("/api/visas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, visaType, totalAmount: Number(totalAmount), reason }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "签证提交失败。");
      return;
    }
    toast.success("签证已提交。");
    startTransition(() => router.push("/change-visa"));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>工程签证</CardTitle>
          <CardDescription>记录工程量、费用、原因与总金额。</CardDescription>
        </div>
      </CardHeader>
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="visa-title">签证标题</Label>
          <Input id="visa-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="visa-type">签证类型</Label>
          <Input id="visa-type" value={visaType} onChange={(event) => setVisaType(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="visa-total-amount">总金额</Label>
          <Input id="visa-total-amount" type="number" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="visa-reason">签证原因</Label>
          <Textarea id="visa-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
      </div>
      <QuantityTable />
      <div className="mt-4">
        <CostSummary />
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "提交中..." : "提交签证"}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { QuantityItem } from "@/types";

export function QuantityUpdateForm({ quantity }: { quantity: QuantityItem }) {
  const router = useRouter();
  const [form, setForm] = useState({
    completedAmount: "",
    updatedAt: new Date().toISOString().slice(0, 10),
    submittedBy: "",
    description: "",
    delayReason: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const response = await fetch(`/api/quantities/${quantity.id}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, completedAmount: Number(form.completedAmount), attachments: [] }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "工程量更新失败。"));
      return;
    }
    toast.success("完成量已更新。");
    setForm({ completedAmount: "", updatedAt: new Date().toISOString().slice(0, 10), submittedBy: "", description: "", delayReason: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>填报完成量</CardTitle>
          <CardDescription>本次完成量会自动累计到已完工程量，并重新计算剩余量、百分比和状态。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="本次完成量">
          <Input type="number" min={0} value={form.completedAmount} onChange={(event) => update("completedAmount", event.target.value)} placeholder={quantity.unit} />
        </Field>
        <Field label="更新日期">
          <Input type="date" value={form.updatedAt} onChange={(event) => update("updatedAt", event.target.value)} />
        </Field>
        <Field label="填报人">
          <Input value={form.submittedBy} onChange={(event) => update("submittedBy", event.target.value)} placeholder="如 林施工" />
        </Field>
        <Field label="偏差原因">
          <Input value={form.delayReason} onChange={(event) => update("delayReason", event.target.value)} placeholder="如 天气、材料、图纸、交叉作业" />
        </Field>
        <Field label="现场说明" className="md:col-span-2">
          <Textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="说明本次完成范围、计量依据和现场证据。" />
        </Field>
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="button" onClick={submit}>
          提交完成量
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

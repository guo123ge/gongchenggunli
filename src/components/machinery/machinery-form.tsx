"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export function MachineryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("塔吊 2#");
  const [code, setCode] = useState(`MC-${Date.now()}`);
  const [operator, setOperator] = useState("李师傅");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("2026-06-15");

  async function submit() {
    const response = await fetch("/api/machinery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, operator, nextMaintenanceDate }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "机械登记失败。");
      return;
    }
    toast.success("机械已登记。");
    startTransition(() => router.push(`/machinery/${body.data.id}`));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>机械进场登记</CardTitle>
          <CardDescription>登记设备信息、操作人员和下次保养日期。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="machinery-name">设备名称</Label>
          <Input id="machinery-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-code">设备编号</Label>
          <Input id="machinery-code" value={code} onChange={(event) => setCode(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-operator">操作人员</Label>
          <Input id="machinery-operator" value={operator} onChange={(event) => setOperator(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-next-maintenance">下次保养日期</Label>
          <Input
            id="machinery-next-maintenance"
            type="date"
            value={nextMaintenanceDate}
            onChange={(event) => setNextMaintenanceDate(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !name.trim() || !code.trim()}>
          {isPending ? "提交中..." : "提交登记"}
        </Button>
      </div>
    </Card>
  );
}

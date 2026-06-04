"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ChangeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("地下室集水坑位置调整");
  const [reason, setReason] = useState("现场管线综合协调");
  const [estimatedCost, setEstimatedCost] = useState("18600");
  const [content, setContent] = useState("集水坑向东偏移 600mm，以避让主排水管线冲突。");

  async function submit() {
    const response = await fetch("/api/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, reason, content, estimatedCost: Number(estimatedCost) }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "变更提交失败。");
      return;
    }
    toast.success("变更已提交。");
    startTransition(() => router.push("/change-visa"));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>设计变更</CardTitle>
          <CardDescription>提交变更原因、范围、影响与预估费用。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="change-title">变更标题</Label>
          <Input id="change-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="change-estimated-cost">预估费用</Label>
          <Input id="change-estimated-cost" type="number" value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="change-reason">变更原因</Label>
          <Input id="change-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="change-content">变更内容</Label>
          <Textarea id="change-content" value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "提交中..." : "提交变更"}
        </Button>
      </div>
    </Card>
  );
}

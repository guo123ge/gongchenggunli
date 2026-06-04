"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export function IncidentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("材料吊运险肇事件");
  const [incidentDate, setIncidentDate] = useState("2026-06-01");
  const [level, setLevel] = useState("中");
  const [description, setDescription] = useState("吊运作业过程中出现险肇事件，现场已隔离并完成初步处置。");

  async function submit() {
    const response = await fetch("/api/safety/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, incidentDate, level, description }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "事件上报失败。");
      return;
    }
    toast.success("事件已上报。");
    startTransition(() => router.push(`/safety/incidents/${body.data.id}`));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>安全事件上报</CardTitle>
          <CardDescription>记录事件等级、经过、处置措施与复盘跟踪。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="incident-title">事件标题</Label>
          <Input id="incident-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="incident-date">事件日期</Label>
          <Input id="incident-date" type="date" value={incidentDate} onChange={(event) => setIncidentDate(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="incident-level">事件等级</Label>
          <Input id="incident-level" value={level} onChange={(event) => setLevel(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="incident-description">事件描述</Label>
          <Textarea id="incident-description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "提交中..." : "提交事件"}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ShiftForm({ machineryId }: { machineryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [workDate, setWorkDate] = useState("2026-06-01");
  const [shiftHours, setShiftHours] = useState("8");
  const [workContent, setWorkContent] = useState("材料吊运作业");

  async function submit() {
    const response = await fetch(`/api/machinery/${machineryId}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workDate, shiftHours: Number(shiftHours), workContent }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "台班记录提交失败。");
      return;
    }
    toast.success("台班记录已保存。");
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-3">
      <div>
        <Label>作业日期</Label>
        <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
      </div>
      <div>
        <Label>台班工时</Label>
        <Input type="number" value={shiftHours} onChange={(event) => setShiftHours(event.target.value)} />
      </div>
      <div>
        <Label>作业内容</Label>
        <Textarea value={workContent} onChange={(event) => setWorkContent(event.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !workContent.trim()}>
          {isPending ? "保存中..." : "保存台班记录"}
        </Button>
      </div>
    </div>
  );
}

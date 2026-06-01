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
  const [workContent, setWorkContent] = useState("Material lifting");

  async function submit() {
    const response = await fetch(`/api/machinery/${machineryId}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workDate, shiftHours: Number(shiftHours), workContent }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Shift submission failed.");
      return;
    }
    toast.success("Shift record saved.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-3">
      <div>
        <Label>Work date</Label>
        <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
      </div>
      <div>
        <Label>Shift hours</Label>
        <Input type="number" value={shiftHours} onChange={(event) => setShiftHours(event.target.value)} />
      </div>
      <div>
        <Label>Work content</Label>
        <Textarea value={workContent} onChange={(event) => setWorkContent(event.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !workContent.trim()}>
          {isPending ? "Saving..." : "Save shift"}
        </Button>
      </div>
    </div>
  );
}

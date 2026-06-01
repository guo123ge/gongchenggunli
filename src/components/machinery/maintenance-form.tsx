"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function MaintenanceForm({ machineryId }: { machineryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("Monthly maintenance");
  const [cost, setCost] = useState("1200");

  async function submit() {
    const response = await fetch(`/api/machinery/${machineryId}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, cost: Number(cost) }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Maintenance submission failed.");
      return;
    }
    toast.success("Maintenance record saved.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-3">
      <div>
        <Label>Maintenance content</Label>
        <Textarea value={content} onChange={(event) => setContent(event.target.value)} />
      </div>
      <div>
        <Label>Cost</Label>
        <Input type="number" value={cost} onChange={(event) => setCost(event.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !content.trim()}>
          {isPending ? "Saving..." : "Save maintenance"}
        </Button>
      </div>
    </div>
  );
}

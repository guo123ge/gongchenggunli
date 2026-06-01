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
  const [title, setTitle] = useState("Basement sump location adjustment");
  const [reason, setReason] = useState("Site pipe coordination");
  const [estimatedCost, setEstimatedCost] = useState("18600");
  const [content, setContent] = useState("Move the sump 600mm east to avoid main drainage pipe conflict.");

  async function submit() {
    const response = await fetch("/api/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, reason, content, estimatedCost: Number(estimatedCost) }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Change submission failed.");
      return;
    }
    toast.success("Change submitted.");
    startTransition(() => router.push("/change-visa"));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Design change</CardTitle>
          <CardDescription>Submit change reason, scope, impact, and estimated cost.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="change-title">Change title</Label>
          <Input id="change-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="change-estimated-cost">Estimated cost</Label>
          <Input id="change-estimated-cost" type="number" value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="change-reason">Reason</Label>
          <Input id="change-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="change-content">Change content</Label>
          <Textarea id="change-content" value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "Submitting..." : "Submit change"}
        </Button>
      </div>
    </Card>
  );
}

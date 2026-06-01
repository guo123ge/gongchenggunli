"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";

export function HazardForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("Missing edge protection");
  const [riskLevel, setRiskLevel] = useState("high");
  const [area, setArea] = useState("Tower A floor 8");
  const [dueDate, setDueDate] = useState("2026-06-02");
  const [description, setDescription] = useState("Edge protection is incomplete and needs immediate rectification.");

  async function submit() {
    const response = await fetch("/api/safety/hazards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, riskLevel, area, dueDate, description }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Hazard submission failed.");
      return;
    }
    toast.success("Hazard submitted.");
    startTransition(() => router.push(`/safety/hazards/${body.data.id}`));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>New safety hazard</CardTitle>
            <CardDescription>Record hazard description, risk level, due date, and site evidence.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="hazard-title">Hazard title</Label>
            <Input id="hazard-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hazard-risk-level">Risk level</Label>
            <Input id="hazard-risk-level" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hazard-area">Area</Label>
            <Input id="hazard-area" value={area} onChange={(event) => setArea(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hazard-due-date">Rectification due date</Label>
            <Input id="hazard-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="hazard-description">Hazard description</Label>
            <Textarea id="hazard-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>
      </Card>
      <ImageUpload />
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "Submitting..." : "Submit hazard"}
        </Button>
      </div>
    </div>
  );
}

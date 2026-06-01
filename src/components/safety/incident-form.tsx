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
  const [title, setTitle] = useState("Material lifting near miss");
  const [incidentDate, setIncidentDate] = useState("2026-06-01");
  const [level, setLevel] = useState("medium");
  const [description, setDescription] = useState("Near miss during lifting operation. Area was isolated and reviewed.");

  async function submit() {
    const response = await fetch("/api/safety/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, incidentDate, level, description }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Incident submission failed.");
      return;
    }
    toast.success("Incident submitted.");
    startTransition(() => router.push(`/safety/incidents/${body.data.id}`));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Safety incident report</CardTitle>
          <CardDescription>Record incident level, process, handling notes, and review follow-up.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="incident-title">Incident title</Label>
          <Input id="incident-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="incident-date">Incident date</Label>
          <Input id="incident-date" type="date" value={incidentDate} onChange={(event) => setIncidentDate(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="incident-level">Incident level</Label>
          <Input id="incident-level" value={level} onChange={(event) => setLevel(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="incident-description">Incident description</Label>
          <Textarea id="incident-description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "Submitting..." : "Submit incident"}
        </Button>
      </div>
    </Card>
  );
}

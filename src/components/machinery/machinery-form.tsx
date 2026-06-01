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
  const [name, setName] = useState("Tower crane 2");
  const [code, setCode] = useState(`MC-${Date.now()}`);
  const [operator, setOperator] = useState("Operator Li");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("2026-06-15");

  async function submit() {
    const response = await fetch("/api/machinery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, operator, nextMaintenanceDate }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Machinery registration failed.");
      return;
    }
    toast.success("Machinery registered.");
    startTransition(() => router.push(`/machinery/${body.data.id}`));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Machinery entry registration</CardTitle>
          <CardDescription>Register equipment, operator, and the next maintenance date.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="machinery-name">Equipment name</Label>
          <Input id="machinery-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-code">Equipment code</Label>
          <Input id="machinery-code" value={code} onChange={(event) => setCode(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-operator">Operator</Label>
          <Input id="machinery-operator" value={operator} onChange={(event) => setOperator(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="machinery-next-maintenance">Next maintenance</Label>
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
          {isPending ? "Submitting..." : "Submit registration"}
        </Button>
      </div>
    </Card>
  );
}

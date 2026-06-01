"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { QuantityTable } from "./quantity-table";
import { CostSummary } from "./cost-summary";

export function VisaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("Night work lighting shift");
  const [visaType, setVisaType] = useState("material_machinery");
  const [totalAmount, setTotalAmount] = useState("5760");
  const [reason, setReason] = useState("Additional lighting and generator shift for night rush work.");

  async function submit() {
    const response = await fetch("/api/visas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, visaType, totalAmount: Number(totalAmount), reason }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Visa submission failed.");
      return;
    }
    toast.success("Visa submitted.");
    startTransition(() => router.push("/change-visa"));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Engineering visa</CardTitle>
          <CardDescription>Record quantities, cost, reason, and total amount.</CardDescription>
        </div>
      </CardHeader>
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="visa-title">Visa title</Label>
          <Input id="visa-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="visa-type">Visa type</Label>
          <Input id="visa-type" value={visaType} onChange={(event) => setVisaType(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="visa-total-amount">Total amount</Label>
          <Input id="visa-total-amount" type="number" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="visa-reason">Reason</Label>
          <Textarea id="visa-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
      </div>
      <QuantityTable />
      <div className="mt-4">
        <CostSummary />
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "Submitting..." : "Submit visa"}
        </Button>
      </div>
    </Card>
  );
}

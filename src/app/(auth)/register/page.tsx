"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("New Site Member");
  const [phone, setPhone] = useState("13900000000");
  const [username, setUsername] = useState(`user${Date.now()}`);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, phone, username }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "Registration failed.");
      return;
    }
    toast.success(body.data?.message ?? "Registration request submitted.");
    startTransition(() => router.push("/login"));
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div>
            <CardTitle>Register project member</CardTitle>
            <CardDescription>Create a pending account request for PM role assignment.</CardDescription>
          </div>
        </CardHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="register-display-name">Name</Label>
            <Input id="register-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="register-phone">Phone</Label>
            <Input id="register-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="register-username">Username</Label>
            <Input id="register-username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !displayName.trim() || !phone.trim() || !username.trim()}>
            {isPending ? "Submitting..." : "Submit registration"}
          </Button>
          <Link href="/login" className="block text-center text-sm text-brand">
            Already have an account? Sign in
          </Link>
        </form>
      </Card>
    </main>
  );
}

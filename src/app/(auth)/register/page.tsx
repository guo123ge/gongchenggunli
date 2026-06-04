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
  const [displayName, setDisplayName] = useState("新成员");
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
      toast.error(body.error ?? "注册失败。");
      return;
    }
    toast.success(body.data?.message ?? "注册申请已提交。");
    startTransition(() => router.push("/login"));
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div>
            <CardTitle>项目成员注册</CardTitle>
            <CardDescription>提交账号申请后，由项目经理在审核中心分配角色。</CardDescription>
          </div>
        </CardHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="register-display-name">姓名</Label>
            <Input id="register-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="register-phone">手机号</Label>
            <Input id="register-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="register-username">账号</Label>
            <Input id="register-username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !displayName.trim() || !phone.trim() || !username.trim()}>
            {isPending ? "提交中..." : "提交注册"}
          </Button>
          <Link href="/login" className="block text-center text-sm text-brand">
            已有账号，去登录
          </Link>
        </form>
      </Card>
    </main>
  );
}

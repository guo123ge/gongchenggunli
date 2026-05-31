"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    const result = await signIn("credentials", {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("账号或密码不正确");
      return;
    }

    toast.success("登录成功");
    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <Label>账号</Label>
        <Input name="username" defaultValue="pm" autoComplete="username" />
      </div>
      <div>
        <Label>密码</Label>
        <Input name="password" type="password" defaultValue="123456" autoComplete="current-password" />
      </div>
      <div>
        <Label>项目</Label>
        <Input value="江湾科创中心二期总承包工程" readOnly />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中..." : "进入平台"}
      </Button>
    </form>
  );
}


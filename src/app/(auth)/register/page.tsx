import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader><div><CardTitle>注册项目成员</CardTitle><CardDescription>创建账号后由 PM 分配项目角色。</CardDescription></div></CardHeader>
        <form className="space-y-4">
          <div><Label>姓名</Label><Input /></div>
          <div><Label>手机号</Label><Input /></div>
          <div><Label>密码</Label><Input type="password" /></div>
          <Button type="button" className="w-full">提交注册</Button>
          <Link href="/login" className="block text-center text-sm text-brand">已有账号，去登录</Link>
        </form>
      </Card>
    </main>
  );
}


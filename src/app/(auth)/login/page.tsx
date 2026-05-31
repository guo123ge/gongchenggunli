import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div>
            <CardTitle>登录施工平台</CardTitle>
            <CardDescription>演示账号：pm / 123456，也可使用 con、mat、safe 等角色账号。</CardDescription>
          </div>
        </CardHeader>
        <form className="space-y-4">
          <div><Label>账号</Label><Input defaultValue="pm" /></div>
          <div><Label>密码</Label><Input type="password" defaultValue="123456" /></div>
          <div><Label>项目</Label><Input defaultValue="江湾科创中心二期总承包工程" /></div>
          <Link href="/dashboard" className="block"><Button type="button" className="w-full">进入平台</Button></Link>
        </form>
      </Card>
    </main>
  );
}


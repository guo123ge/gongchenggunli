import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Suspense fallback={<p className="text-sm text-muted">登录表单加载中...</p>}>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}

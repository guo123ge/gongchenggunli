import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import { users } from "@/lib/mock-data";
import { readStore } from "@/lib/server-store";

export default async function LoginPage() {
  const data = await readStore();
  const projects = (data.projects ?? [data.project]).filter(Boolean).map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
  }));
  const userOptions = users.map((item) => ({
    username: item.username,
    displayName: item.displayName,
    roleLabel: ROLE_LABELS[item.role],
  }));

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div>
            <CardTitle>登录施工平台</CardTitle>
            <CardDescription>选择中文角色账号后输入密码进入平台，演示密码统一为 123456。</CardDescription>
          </div>
        </CardHeader>
        <Suspense fallback={<p className="text-sm text-muted">登录表单加载中...</p>}>
          <LoginForm users={userOptions} projects={projects} activeProjectId={data.project.id} />
        </Suspense>
      </Card>
    </main>
  );
}

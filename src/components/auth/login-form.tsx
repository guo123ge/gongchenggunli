"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type LoginProjectOption = {
  id: string;
  name: string;
  code: string;
};

type LoginUserOption = {
  username: string;
  displayName: string;
  roleLabel: string;
};

type LoginFormProps = {
  users: LoginUserOption[];
  projects: LoginProjectOption[];
  activeProjectId: string;
};

export function LoginForm({ users, projects, activeProjectId }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(users[0]?.username ?? "pm");
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      toast.error("账号或密码不正确");
      return;
    }

    if (projectId) {
      const projectResponse = await fetch(`/api/projects/${projectId}`, { method: "PATCH" });
      if (!projectResponse.ok) {
        setLoading(false);
        toast.error("登录成功，但项目切换失败，请重新选择项目。");
        return;
      }
    }

    setLoading(false);
    toast.success("登录成功");
    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <Label>账号</Label>
        <select
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
        >
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.roleLabel}（{user.displayName}）
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>密码</Label>
        <Input name="password" type="password" defaultValue="123456" autoComplete="current-password" />
      </div>
      <div>
        <Label>项目</Label>
        <select
          name="projectId"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          disabled={projects.length === 0}
          className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {projects.length === 0 && <p className="mt-2 text-xs text-danger">当前没有可登录的有效项目，请先创建项目。</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading || projects.length === 0 || users.length === 0}>
        {loading ? "登录中..." : "进入平台"}
      </Button>
    </form>
  );
}

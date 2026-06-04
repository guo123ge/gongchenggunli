"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { Project } from "@/types";

type FormState = {
  name: string;
  code: string;
  location: string;
  owner: string;
  contractor: string;
  supervisor: string;
  status: Project["status"];
  startDate: string;
  plannedEndDate: string;
};

const defaultState: FormState = {
  name: "新建施工项目",
  code: `XM-${Date.now().toString().slice(-6)}`,
  location: "请输入项目地址",
  owner: "请输入建设单位",
  contractor: "请输入施工单位",
  supervisor: "",
  status: "preparation",
  startDate: "2026-06-01",
  plannedEndDate: "2027-06-01",
};

const statusOptions: Array<{ value: Project["status"]; label: string }> = [
  { value: "preparation", label: "筹备中" },
  { value: "in_progress", label: "施工中" },
  { value: "suspended", label: "已停工" },
  { value: "completed", label: "已完工" },
];

export function ProjectForm({ project, mode = "create" }: { project?: Project; mode?: "create" | "edit" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(projectToForm(project));
  const isEdit = mode === "edit" && project;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(isEdit ? `/api/projects/${project.id}` : "/api/projects", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, intent: isEdit ? "update" : "create" }),
    });
    const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? (isEdit ? "项目保存失败。" : "项目创建失败。"));
      return;
    }

    toast.success(isEdit ? "项目信息已保存。" : "项目已创建。");
    startTransition(() => router.push("/projects"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{isEdit ? "编辑项目" : "新建项目"}</CardTitle>
          <CardDescription>{isEdit ? "修改项目基础信息，保存后顶部项目名称和项目列表会同步更新。" : "创建后会自动设为当前项目，后续日志、材料、安全等模块默认使用该项目。"}</CardDescription>
        </div>
      </CardHeader>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2">
          <Label htmlFor="project-name">项目名称</Label>
          <Input id="project-name" value={form.name} onChange={(event) => update("name", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-code">项目编号</Label>
          <Input id="project-code" value={form.code} onChange={(event) => update("code", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-status">项目状态</Label>
          <select
            id="project-status"
            value={form.status}
            onChange={(event) => update("status", event.target.value as Project["status"])}
            className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="project-location">项目地址</Label>
          <Input id="project-location" value={form.location} onChange={(event) => update("location", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-owner">建设单位</Label>
          <Input id="project-owner" value={form.owner} onChange={(event) => update("owner", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-contractor">施工单位</Label>
          <Input id="project-contractor" value={form.contractor} onChange={(event) => update("contractor", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-supervisor">监理单位</Label>
          <Input id="project-supervisor" value={form.supervisor} onChange={(event) => update("supervisor", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-start-date">开工日期</Label>
          <Input id="project-start-date" type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-end-date">计划完工日期</Label>
          <Input id="project-end-date" type="date" value={form.plannedEndDate} onChange={(event) => update("plannedEndDate", event.target.value)} />
        </div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/projects")}>
            取消
          </Button>
          <Button type="submit" disabled={isPending || !form.name.trim() || !form.code.trim()}>
            {isPending ? "保存中..." : isEdit ? "保存修改" : "创建项目"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function projectToForm(project?: Project): FormState {
  if (!project) return defaultState;
  return {
    name: project.name,
    code: project.code,
    location: project.location,
    owner: project.owner,
    contractor: project.contractor,
    supervisor: project.supervisor ?? "",
    status: project.status,
    startDate: project.startDate,
    plannedEndDate: project.plannedEndDate,
  };
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { QUANTITY_CATEGORIES } from "@/lib/constants";
import { getQuantityPercent, getRemainingDays, getRemainingQuantity } from "@/lib/quantity-utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Project, QuantityItem } from "@/types";

type QuantityFormProps = {
  project: Project;
  initial?: QuantityItem;
};

export function QuantityForm({ project, initial }: QuantityFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    unit: initial?.unit ?? "m3",
    totalQuantity: String(initial?.totalQuantity ?? ""),
    completedQuantity: String(initial?.completedQuantity ?? 0),
    plannedFinishDate: initial?.plannedFinishDate ?? "",
    workArea: initial?.workArea ?? "",
    category: initial?.category ?? QUANTITY_CATEGORIES[0],
    owner: initial?.owner ?? "",
    remark: initial?.remark ?? "",
  });
  const totalQuantity = Number(form.totalQuantity || 0);
  const completedQuantity = Number(form.completedQuantity || 0);
  const preview = { totalQuantity, completedQuantity, plannedFinishDate: form.plannedFinishDate };

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const payload = {
      projectId: project.id,
      ...form,
      totalQuantity,
      completedQuantity,
    };
    const response = await fetch(initial ? `/api/quantities/${initial.id}` : "/api/quantities", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "工程量保存失败。"));
      return;
    }
    toast.success(initial ? "工程量已更新。" : "工程量已创建。");
    router.push(initial ? `/quantity/${initial.id}` : "/quantity");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{initial ? "编辑工程量" : "新建工程量"}</CardTitle>
          <CardDescription>剩余工程量、完成百分比和剩余工期由系统自动计算，不需要手动填写。</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="工程量名称">
          <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="如 地下室顶板混凝土" />
        </Field>
        <Field label="专业类别">
          <select value={form.category} onChange={(event) => update("category", event.target.value)} className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand">
            {QUANTITY_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="单位">
          <Input value={form.unit} onChange={(event) => update("unit", event.target.value)} placeholder="m3、吨、m2、米" />
        </Field>
        <Field label="全部数量">
          <Input type="number" min={0} value={form.totalQuantity} onChange={(event) => update("totalQuantity", event.target.value)} />
        </Field>
        <Field label="已完工程量">
          <Input type="number" min={0} value={form.completedQuantity} onChange={(event) => update("completedQuantity", event.target.value)} />
        </Field>
        <Field label="计划完工日期">
          <Input type="date" value={form.plannedFinishDate} onChange={(event) => update("plannedFinishDate", event.target.value)} />
        </Field>
        <Field label="施工部位">
          <Input value={form.workArea} onChange={(event) => update("workArea", event.target.value)} placeholder="如 地下室 B 区" />
        </Field>
        <Field label="责任人">
          <Input value={form.owner} onChange={(event) => update("owner", event.target.value)} placeholder="如 林施工" />
        </Field>
        <Field label="备注" className="md:col-span-2">
          <Textarea value={form.remark} onChange={(event) => update("remark", event.target.value)} placeholder="记录计量口径、验收依据或风险说明。" />
        </Field>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-panel-soft p-4 text-sm md:grid-cols-3">
        <Preview label="剩余工程量" value={`${getRemainingQuantity(preview)} ${form.unit || ""}`} />
        <Preview label="完成百分比" value={`${getQuantityPercent(preview)}%`} />
        <Preview label="剩余工期" value={getRemainingDays(form.plannedFinishDate) === null ? "未设置计划日期" : `${getRemainingDays(form.plannedFinishDate)} 天`} />
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          返回
        </Button>
        <Button type="button" onClick={submit}>
          保存工程量
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DraftIndicator } from "@/components/shared/draft-indicator";
import { ImageUpload } from "@/components/shared/image-upload";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { TemplateSelector } from "@/components/daily-log/template-selector";
import { useDebounce } from "@/hooks/use-debounce";
import { useDraftStore } from "@/stores/draft-store";
import type { Project } from "@/types";

type FormState = {
  workDate: string;
  weather: string;
  tempLow: string;
  tempHigh: string;
  workPosition: string;
  workProcess: string;
  workContent: string;
  laborCount: string;
  qualityCheck: string;
  safetyCheck: string;
};

const initialState: FormState = {
  workDate: "2026-05-31",
  weather: "晴",
  tempLow: "22",
  tempHigh: "31",
  workPosition: "地下室 B 区",
  workProcess: "混凝土浇筑",
  workContent: "",
  laborCount: "0",
  qualityCheck: "",
  safetyCheck: "",
};

export function LogForm({ project }: { project: Project }) {
  const [form, setForm] = useState<FormState>(initialState);
  const debounced = useDebounce(form, 1200);
  const { saving, saveDraft } = useDraftStore();

  useEffect(() => {
    void saveDraft("daily-log-new", "daily-log", debounced);
  }, [debounced, saveDraft]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(status: "draft" | "submitted") {
    const response = await fetch("/api/daily-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        ...form,
        tempLow: Number(form.tempLow),
        tempHigh: Number(form.tempHigh),
        laborCount: Number(form.laborCount),
        status,
        laborDetail: [{ type: "混凝土工", count: Number(form.laborCount) }],
        machineryUsed: ["塔吊 1#", "汽车泵"],
        materialUsed: [{ name: "C35 商品混凝土", quantity: 238, unit: "m3" }],
      }),
    });
    const body = await response.json();
    if (body.ok) toast.success(status === "draft" ? "草稿已保存" : "已提交审核");
    else toast.error(body.error ?? "提交失败");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>新建施工日志</CardTitle>
            <CardDescription>支持模板填充、自动草稿、照片水印和离线队列。</CardDescription>
          </div>
          <DraftIndicator saving={saving} />
        </CardHeader>

        <TemplateSelector
          onSelect={(template) =>
            setForm((current) => ({
              ...current,
              workContent: template.workContent,
              workProcess: template.workProcess,
              qualityCheck: template.qualityCheck,
              safetyCheck: template.safetyCheck,
            }))
          }
        />
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>日期</Label>
            <Input type="date" value={form.workDate} onChange={(event) => update("workDate", event.target.value)} />
          </div>
          <div>
            <Label>天气</Label>
            <Input value={form.weather} onChange={(event) => update("weather", event.target.value)} />
          </div>
          <div>
            <Label>最低温</Label>
            <Input type="number" value={form.tempLow} onChange={(event) => update("tempLow", event.target.value)} />
          </div>
          <div>
            <Label>最高温</Label>
            <Input type="number" value={form.tempHigh} onChange={(event) => update("tempHigh", event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>施工部位</Label>
            <Input value={form.workPosition} onChange={(event) => update("workPosition", event.target.value)} />
          </div>
          <div>
            <Label>施工工序</Label>
            <Input value={form.workProcess} onChange={(event) => update("workProcess", event.target.value)} />
          </div>
          <div>
            <Label>出勤人数</Label>
            <Input type="number" value={form.laborCount} onChange={(event) => update("laborCount", event.target.value)} />
          </div>
          <div className="md:col-span-4">
            <Label>施工内容</Label>
            <Textarea value={form.workContent} onChange={(event) => update("workContent", event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>质量检查</Label>
            <Textarea value={form.qualityCheck} onChange={(event) => update("qualityCheck", event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>安全检查</Label>
            <Textarea value={form.safetyCheck} onChange={(event) => update("safetyCheck", event.target.value)} />
          </div>
        </div>
      </Card>

      <ImageUpload />
      <VoiceRecorder />

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => submit("draft")}>
          存为草稿
        </Button>
        <Button type="button" onClick={() => submit("submitted")}>
          提交审核
        </Button>
      </div>
    </div>
  );
}

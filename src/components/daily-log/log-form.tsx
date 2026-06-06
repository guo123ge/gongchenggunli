"use client";

import { ClipboardCheck, CloudSun, HardHat, ImageIcon, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { TemplateSelector } from "@/components/daily-log/template-selector";
import { DraftIndicator } from "@/components/shared/draft-indicator";
import { ImageUpload, type UploadedImage } from "@/components/shared/image-upload";
import { ManualDateInput, normalizeManualDate } from "@/components/shared/manual-date-input";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { WEATHER_OPTIONS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useDraftStore } from "@/stores/draft-store";
import type { Project } from "@/types";

type ResourceRow = { name: string; count: string; unit?: string };

type FormState = {
  workDate: string;
  weather: "晴" | "阴" | "雨" | "雪" | "大风";
  wind: string;
  tempLow: string;
  tempHigh: string;
  workPosition: string;
  workProcess: string;
  progressPercent: string;
  workContent: string;
  qualityCheck: string;
  safetyCheck: string;
  delays: string;
  instructions: string;
  tomorrowPlan: string;
};

const initialState: FormState = {
  workDate: "2026/05/31",
  weather: "晴",
  wind: "东北风 2 级",
  tempLow: "22",
  tempHigh: "31",
  workPosition: "地下室 B 区",
  workProcess: "混凝土浇筑",
  progressPercent: "100",
  workContent: "",
  qualityCheck: "",
  safetyCheck: "",
  delays: "",
  instructions: "",
  tomorrowPlan: "",
};

const initialLaborRows: ResourceRow[] = [
  { name: "钢筋工", count: "0" },
  { name: "木工", count: "0" },
  { name: "混凝土工", count: "0" },
  { name: "普工", count: "0" },
];

const initialMachineryRows: ResourceRow[] = [
  { name: "塔吊 1#", count: "0", unit: "台班" },
  { name: "汽车泵", count: "0", unit: "台班" },
];

const initialMaterialRows: ResourceRow[] = [{ name: "C35 商品混凝土", count: "0", unit: "m3" }];

export function LogForm({ project }: { project: Project }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [laborRows, setLaborRows] = useState<ResourceRow[]>(initialLaborRows);
  const [machineryRows, setMachineryRows] = useState<ResourceRow[]>(initialMachineryRows);
  const [materialRows, setMaterialRows] = useState<ResourceRow[]>(initialMaterialRows);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const debounced = useDebounce({ form, laborRows, machineryRows, materialRows }, 1200);
  const { saving, saveDraft } = useDraftStore();

  const laborCount = useMemo(() => sumRows(laborRows), [laborRows]);

  useEffect(() => {
    void saveDraft("daily-log-new", "daily-log", debounced);
  }, [debounced, saveDraft]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(status: "draft" | "submitted") {
    const payload = {
      projectId: project.id,
      workDate: normalizeManualDate(form.workDate),
      weather: form.weather,
      tempLow: Number(form.tempLow),
      tempHigh: Number(form.tempHigh),
      workPosition: form.workPosition,
      workProcess: form.workProcess,
      laborCount,
      laborDetail: laborRows.filter((item) => item.name.trim()).map((item) => ({ type: item.name.trim(), count: Number(item.count || 0) })),
      machineryUsed: machineryRows.filter((item) => item.name.trim() && Number(item.count || 0) > 0).map((item) => `${item.name.trim()} ${item.count}${item.unit ? item.unit : ""}`),
      materialUsed: materialRows
        .filter((item) => item.name.trim())
        .map((item) => ({ name: item.name.trim(), quantity: Number(item.count || 0), unit: item.unit || "" })),
      workContent: buildWorkContent(form),
      qualityCheck: buildQualityCheck(form),
      safetyCheck: buildSafetyCheck(form),
      status,
      attachments: images.map((item) => ({
        id: item.id,
        fileName: item.fileName,
        url: item.uploadedUrl ?? item.previewUrl,
        fileType: item.fileType,
        hasWatermark: true,
      })),
    };

    const response = await fetch("/api/daily-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "施工日志提交失败。");
      return;
    }
    toast.success(status === "draft" ? "草稿已保存。" : "日志已提交审核。");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>新建施工日志</CardTitle>
            <CardDescription>按工程日报最佳实践记录天气、劳动力、机械材料、施工进展、质量安全、影响事项和现场影像。</CardDescription>
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

      <SectionCard icon={CloudSun} title="一、基础信息与天气条件" description="记录日期、天气、温度、风力和施工部位，便于后续追溯施工环境。">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="日期">
            <ManualDateInput value={form.workDate} onChange={(value) => update("workDate", value)} />
          </Field>
          <Field label="天气">
            <select value={form.weather} onChange={(event) => update("weather", event.target.value as FormState["weather"])} className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand">
              {WEATHER_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="最低温">
            <Input type="number" value={form.tempLow} onChange={(event) => update("tempLow", event.target.value)} />
          </Field>
          <Field label="最高温">
            <Input type="number" value={form.tempHigh} onChange={(event) => update("tempHigh", event.target.value)} />
          </Field>
          <Field label="风力风向">
            <Input value={form.wind} onChange={(event) => update("wind", event.target.value)} placeholder="如 东北风 2 级" />
          </Field>
          <Field label="施工部位">
            <Input value={form.workPosition} onChange={(event) => update("workPosition", event.target.value)} />
          </Field>
          <Field label="施工工序">
            <Input value={form.workProcess} onChange={(event) => update("workProcess", event.target.value)} />
          </Field>
          <Field label="完成进度（%）">
            <Input type="number" min={0} max={100} value={form.progressPercent} onChange={(event) => update("progressPercent", event.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={HardHat} title="二、现场资源投入" description="分别记录劳动力、机械台班和主要材料用量，避免只填总人数导致后续统计困难。">
        <div className="grid gap-5 xl:grid-cols-3">
          <EditableRows title={`劳动力明细（合计 ${laborCount} 人）`} nameLabel="班组/工种" countLabel="人数" rows={laborRows} onChange={setLaborRows} />
          <EditableRows title="机械设备" nameLabel="设备名称" countLabel="数量" rows={machineryRows} onChange={setMachineryRows} showUnit />
          <EditableRows title="主要材料" nameLabel="材料名称" countLabel="用量" rows={materialRows} onChange={setMaterialRows} showUnit />
        </div>
      </SectionCard>

      <SectionCard icon={ClipboardCheck} title="三、施工进展与管理事项" description="记录实际完成内容、现场指令、影响因素和次日计划。">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="施工内容" className="lg:col-span-2">
            <Textarea value={form.workContent} onChange={(event) => update("workContent", event.target.value)} placeholder="说明今日完成工程量、关键工序、作业面交接和现场协调情况。" />
          </Field>
          <Field label="影响事项 / 延误原因">
            <Textarea value={form.delays} onChange={(event) => update("delays", event.target.value)} placeholder="如天气、图纸、材料、机械、交叉作业等影响。" />
          </Field>
          <Field label="现场指令 / 协调事项">
            <Textarea value={form.instructions} onChange={(event) => update("instructions", event.target.value)} placeholder="记录建设、监理、总包或分包协调要求。" />
          </Field>
          <Field label="次日计划" className="lg:col-span-2">
            <Textarea value={form.tomorrowPlan} onChange={(event) => update("tomorrowPlan", event.target.value)} placeholder="明确下一工作日作业面、资源需求和需提前协调事项。" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="四、质量与安全检查" description="将质量验收、安全观察和整改闭环分开记录，便于审核和追责。">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="质量检查">
            <Textarea value={form.qualityCheck} onChange={(event) => update("qualityCheck", event.target.value)} placeholder="记录实测实量、隐蔽验收、试块留置、材料复核、报验情况。" />
          </Field>
          <Field label="安全检查">
            <Textarea value={form.safetyCheck} onChange={(event) => update("safetyCheck", event.target.value)} placeholder="记录临边洞口、临电、机械、消防、文明施工和整改闭环情况。" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon={ImageIcon} title="五、影像资料与语音备注" description="现场照片和语音会自动进入资料库，作为日志佐证材料。">
        <div className="space-y-4">
          <ImageUpload module="daily-log" titlePrefix="施工日志照片" onChange={setImages} />
          <VoiceRecorder
            onTranscript={(text) =>
              setForm((current) => ({
                ...current,
                workContent: current.workContent ? `${current.workContent}\n${text}` : text,
              }))
            }
          />
        </div>
      </SectionCard>

      <div className="sticky bottom-20 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-border bg-background/80 p-3 backdrop-blur lg:bottom-4">
        <Button type="button" variant="secondary" onClick={() => submit("draft")}>
          保存为草稿
        </Button>
        <Button type="button" onClick={() => submit("submitted")}>
          提交审核
        </Button>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-4 text-brand" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {children}
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

function EditableRows({
  title,
  nameLabel,
  countLabel,
  rows,
  onChange,
  showUnit = false,
}: {
  title: string;
  nameLabel: string;
  countLabel: string;
  rows: ResourceRow[];
  onChange: (rows: ResourceRow[]) => void;
  showUnit?: boolean;
}) {
  function updateRow(index: number, patch: Partial<ResourceRow>) {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...rows, { name: "", count: "0", unit: showUnit ? "" : undefined }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">{title}</p>
        <Button type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={addRow}>
          增加
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-panel-soft p-2 md:grid-cols-[1fr_5rem_5rem_auto]">
            <Input value={row.name} onChange={(event) => updateRow(index, { name: event.target.value })} placeholder={nameLabel} />
            <Input type="number" min={0} value={row.count} onChange={(event) => updateRow(index, { count: event.target.value })} placeholder={countLabel} />
            {showUnit ? <Input value={row.unit ?? ""} onChange={(event) => updateRow(index, { unit: event.target.value })} placeholder="单位" /> : <div className="hidden md:block" />}
            <Button type="button" variant="ghost" className="h-11 px-3 text-xs" onClick={() => removeRow(index)}>
              删除
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function sumRows(rows: ResourceRow[]) {
  return rows.reduce((total, item) => total + Number(item.count || 0), 0);
}

function buildWorkContent(form: FormState) {
  return [
    `【施工进展】${form.workContent || "未填写"}`,
    `【完成进度】${form.progressPercent || "0"}%`,
    form.delays ? `【影响事项】${form.delays}` : "",
    form.instructions ? `【现场指令】${form.instructions}` : "",
    form.tomorrowPlan ? `【次日计划】${form.tomorrowPlan}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildQualityCheck(form: FormState) {
  return [`【质量检查】${form.qualityCheck || "未填写"}`, `【天气条件】${form.weather}，${form.wind}，${form.tempLow}-${form.tempHigh}℃`].join("\n");
}

function buildSafetyCheck(form: FormState) {
  return [`【安全检查】${form.safetyCheck || "未填写"}`, form.delays ? `【需关注影响】${form.delays}` : ""].filter(Boolean).join("\n");
}

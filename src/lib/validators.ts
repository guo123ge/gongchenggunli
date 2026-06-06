import { z } from "zod";

export const dailyLogSchema = z.object({
  projectId: z.string().min(1),
  workDate: z.coerce.date(),
  weather: z.enum(["晴", "阴", "雨", "雪", "大风"]),
  tempLow: z.coerce.number().min(-50).max(60),
  tempHigh: z.coerce.number().min(-50).max(60),
  workContent: z.string().min(5, "施工内容至少 5 个字"),
  workPosition: z.string().min(1, "请填写施工部位"),
  workProcess: z.string().min(1, "请填写施工工序"),
  laborCount: z.coerce.number().min(0),
  laborDetail: z.array(z.object({ type: z.string().min(1), count: z.coerce.number().min(0) })).default([]),
  machineryUsed: z.array(z.string()).default([]),
  materialUsed: z.array(z.object({ name: z.string(), quantity: z.coerce.number().min(0), unit: z.string() })).default([]),
  qualityCheck: z.string().optional(),
  safetyCheck: z.string().optional(),
  status: z.enum(["draft", "submitted"]).default("draft"),
});

export const materialSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  spec: z.string().min(1),
  unit: z.string().min(1),
  safetyStock: z.coerce.number().min(0).default(0),
});

export const quantitySchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "请填写工程量名称"),
  unit: z.string().min(1, "请填写单位"),
  totalQuantity: z.coerce.number().positive("全部数量必须大于 0"),
  completedQuantity: z.coerce.number().min(0, "已完工程量不能小于 0").default(0),
  plannedFinishDate: z.string().optional(),
  workArea: z.string().min(1, "请填写施工部位"),
  category: z.string().min(1, "请选择专业类别"),
  owner: z.string().min(1, "请填写责任人"),
  remark: z.string().optional(),
});

export const quantityUpdateSchema = z.object({
  completedAmount: z.coerce.number().positive("本次完成量必须大于 0"),
  updatedAt: z.string().min(1, "请选择更新日期"),
  submittedBy: z.string().min(1, "请填写填报人"),
  description: z.string().min(2, "请填写现场说明"),
  delayReason: z.string().optional(),
  attachments: z.array(z.object({ id: z.string(), fileName: z.string(), url: z.string(), fileType: z.string(), hasWatermark: z.boolean().optional() })).default([]),
});

export const reviewSchema = z.object({
  targetType: z.enum(["daily-log", "documents", "material", "machinery", "safety", "archive", "change-visa"]),
  targetId: z.string().min(1),
  action: z.enum(["approve", "reject", "return"]),
  comment: z.string().optional(),
});

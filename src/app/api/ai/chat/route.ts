import { readAppData } from "@/lib/app-data";
import { searchProjectKnowledge } from "@/lib/rag";

function streamMarkdown(markdown: string) {
  const encoder = new TextEncoder();
  const chunks = markdown.match(/[\s\S]{1,32}/g) ?? [markdown];

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? "").trim();
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  const query = message || "施工现场综合分析";
  const [hits, data] = await Promise.all([searchProjectKnowledge(query), readAppData()]);

  const pendingReviews = data.reviewItems.filter((item) => item.status === "submitted");
  const lowStockMaterials = data.materials.filter((item) => item.currentStock < item.safetyStock);
  const openHazards = data.hazards.filter((item) => item.status !== "closed");
  const highRiskHazards = openHazards.filter((item) => item.riskLevel === "high" || item.riskLevel === "critical");
  const maintenanceDue = data.machinery.filter((item) => item.nextMaintenanceDate && item.nextMaintenanceDate <= "2026-06-05");
  const documents = data.documents.slice(0, 5);

  const intent = getIntent(query, attachments.length);
  const markdown = [
    `## ${intent.title}`,
    "",
    intent.intro,
    "",
    "### 当前项目上下文",
    `- 项目：**${data.project.name}**`,
    `- 待审记录：**${pendingReviews.length}** 条`,
    `- 未关闭隐患：**${openHazards.length}** 条，其中高风险/重大风险 **${highRiskHazards.length}** 条`,
    `- 低库存材料：**${lowStockMaterials.length}** 项`,
    `- 近期保养提醒：**${maintenanceDue.length}** 台机械`,
    `- 已集中归档资料：**${data.documents.length}** 份`,
    "",
    ...buildIntentSections(intent.key, query, attachments, {
      pendingReviews,
      lowStockMaterials,
      highRiskHazards,
      maintenanceDue,
      documents,
      hits,
    }),
  ].join("\n");

  return new Response(streamMarkdown(markdown), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

function getIntent(query: string, attachmentCount: number) {
  if (attachmentCount > 0 && /审查|审核|资料|报告|方案|合规|规范/.test(query)) {
    return { key: "document-review", title: "资料 AI 审查", intro: "我会按资料完整性、关键字段、常见风险点和后续动作给出审查建议。" };
  }
  if (attachmentCount > 0 && /安全|隐患|临边|洞口|脚手架|吊装/.test(query)) {
    return { key: "image-safety", title: "现场照片安全检查", intro: "我会结合安全检查常见项，对照片场景给出风险识别和整改建议。" };
  }
  if (attachmentCount > 0 && /材料|价格|市场|钢筋|混凝土|水泥/.test(query)) {
    return { key: "material-price", title: "材料识别与价格咨询", intro: "我会先识别材料类别，再给出询价口径和价格核验建议；实时市场价格需接入外部价格源。" };
  }
  if (/规范|标准|做法|是否符合/.test(query)) {
    return { key: "standard", title: "行业规范咨询", intro: "我会按规范核查思路回答，并提示需要现场复核的关键证据。" };
  }
  return { key: "summary", title: "智能现场综合分析", intro: "我会结合项目数据，给出待办、风险和下一步建议。" };
}

function buildIntentSections(
  key: string,
  query: string,
  attachments: unknown[],
  context: {
    pendingReviews: Array<{ title: string; submittedBy: string }>;
    lowStockMaterials: Array<{ name: string; currentStock: number; safetyStock: number; unit: string }>;
    highRiskHazards: Array<{ title: string; area: string; owner: string }>;
    maintenanceDue: Array<{ name: string; nextMaintenanceDate: string }>;
    documents: Array<{ title: string; submittedBy: string; aiReviewStatus: string }>;
    hits: Array<{ title: string; snippet: string }>;
  },
) {
  const attachmentLines = attachments.length > 0 ? attachments.map((item, index) => `- 附件 ${index + 1}：${describeAttachment(item)}`) : ["- 当前未附加图片、语音或资料。"];

  if (key === "document-review") {
    return [
      "### 附件与资料",
      ...attachmentLines,
      "",
      "### 审查重点",
      "- 核对资料名称、日期、项目名称、签章、责任人、版本号是否完整。",
      "- 核对材料报告、施工方案、隐患整改照片是否与当前项目、当前部位一致。",
      "- 对缺失页、模糊照片、未签字盖章、过期报告标记为需补充。",
      "",
      "### 建议动作",
      "- 将原件上传至资料库，并关联所属模块和提交角色。",
      "- 重要资料建议进入审核中心，由项目经理确认后归档。",
      "- 如需正式合规结论，应接入规范知识库和企业审查清单。",
    ];
  }

  if (key === "image-safety") {
    return [
      "### 照片检查建议",
      ...attachmentLines,
      "",
      "### 常见风险点",
      "- 临边洞口防护是否连续、牢固，警示标识是否清晰。",
      "- 材料堆放是否侵占通道，是否靠近基坑边坡或吊装半径。",
      "- 人员是否佩戴安全帽、安全带，动火/吊装/高处作业是否有防护措施。",
      "",
      "### 现场处置",
      "- 若发现高风险隐患，应立即在安全模块创建隐患并上传整改前后照片。",
      "- 建议安全员复核后再关闭隐患。",
    ];
  }

  if (key === "material-price") {
    return [
      "### 材料识别与询价口径",
      ...attachmentLines,
      "",
      "### 价格核验建议",
      "- 先确认材料名称、规格型号、品牌、计量单位、到货地点和税率口径。",
      "- 市场价格应接入供应商报价、造价信息网或第三方价格源后再给出实时结论。",
      "- 当前系统可先记录询价附件和报价单，集中归档到资料库。",
      "",
      "### 当前低库存材料",
      ...(context.lowStockMaterials.length > 0 ? context.lowStockMaterials.slice(0, 5).map((item) => `- ${item.name}：当前 ${item.currentStock}${item.unit}，安全库存 ${item.safetyStock}${item.unit}`) : ["- 当前暂无低库存材料。"]),
    ];
  }

  if (key === "standard") {
    return [
      "### 规范核查思路",
      `- 你的问题：${query}`,
      "- 先确认工程部位、材料规格、施工工序、验收阶段和适用标准版本。",
      "- 对照规范条文时，应保留照片、检验批、材料报告和旁站记录作为证据。",
      "- 本地演示回答只能作为审查提示，正式条文应接入企业规范库或主管部门发布版本。",
      "",
      "### 相关记录",
      ...(context.hits.length > 0 ? context.hits.map((hit) => `- ${hit.title}：${hit.snippet}`) : ["- 暂未检索到直接相关记录。"]),
    ];
  }

  return [
    "### 重点事项",
    ...(context.pendingReviews.length > 0 ? context.pendingReviews.slice(0, 3).map((item) => `- 待审：${item.title}，提交人 ${item.submittedBy}`) : ["- 暂无待审记录。"]),
    ...(context.highRiskHazards.length > 0 ? context.highRiskHazards.slice(0, 3).map((item) => `- 高风险隐患：${item.title}，区域 ${item.area}，责任人 ${item.owner}`) : []),
    ...(context.maintenanceDue.length > 0 ? context.maintenanceDue.slice(0, 3).map((item) => `- 机械保养：${item.name}，到期日 ${item.nextMaintenanceDate}`) : []),
    "",
    "### 下一步建议",
    "- 先处理待审、隐患、低库存和保养到期事项。",
    "- 各角色上传的照片、语音、报告统一进入资料库，便于追溯和 AI 审查。",
  ];
}

function describeAttachment(value: unknown) {
  if (typeof value !== "object" || value === null) return "未命名附件";
  const item = value as { fileName?: unknown; fileType?: unknown; url?: unknown };
  return `${String(item.fileName ?? "未命名附件")}（${String(item.fileType ?? "未知类型")}）${item.url ? `，已上传` : ""}`;
}

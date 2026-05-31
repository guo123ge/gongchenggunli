import type { ModuleKey, ProjectRole } from "@/types/enums";

export const WEATHER_OPTIONS = ["晴", "阴", "雨", "雪", "大风"] as const;

export const ROLE_LABELS: Record<ProjectRole, string> = {
  PM: "项目经理",
  CON: "施工员",
  TECH: "技术负责人",
  SAFE: "安全员",
  MAT: "材料员",
  DOC: "资料员",
  MACH: "机械管理员",
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "首页",
  "daily-log": "施工日志",
  material: "材料管理",
  machinery: "机械管理",
  safety: "安全管理",
  archive: "档案管理",
  "change-visa": "变更签证",
  review: "审核中心",
};

export const DAILY_LOG_TEMPLATES = [
  {
    id: "concrete",
    name: "混凝土浇筑",
    workContent: "完成地下室顶板混凝土浇筑，泵送、振捣、收面同步进行。",
    workProcess: "模板验收 -> 钢筋隐蔽验收 -> 浇筑 -> 养护",
    qualityCheck: "塌落度、试块留置、振捣密实度符合要求。",
    safetyCheck: "泵管固定牢靠，临边防护完整，夜间照明充足。",
  },
  {
    id: "rebar",
    name: "钢筋绑扎",
    workContent: "完成主体结构梁板钢筋绑扎与垫块布置。",
    workProcess: "放线 -> 下料 -> 绑扎 -> 自检 -> 报验",
    qualityCheck: "钢筋规格、间距、搭接长度抽检合格。",
    safetyCheck: "作业面材料堆放整齐，通道保持畅通。",
  },
  {
    id: "earthwork",
    name: "土方开挖",
    workContent: "完成基坑东侧土方分层开挖与外运。",
    workProcess: "测量复核 -> 分层开挖 -> 边坡修整 -> 排水",
    qualityCheck: "标高控制点复核完成，未超挖。",
    safetyCheck: "基坑周边警戒线和排水沟保持有效。",
  },
];

export const MATERIAL_CATEGORIES = ["钢筋", "混凝土", "木材", "防水", "装饰", "其他"];


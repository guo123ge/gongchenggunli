import type {
  DailyLog,
  DashboardSummary,
  Hazard,
  Machinery,
  Material,
  Project,
  ReviewItem,
  StockRecord,
  User,
} from "@/types";

export const currentUser: User = {
  id: "u-pm",
  username: "pm",
  displayName: "周项目",
  phone: "13800000001",
  globalRole: "admin",
  role: "PM",
};

export const users: User[] = [
  currentUser,
  { id: "u-con", username: "con", displayName: "林施工", phone: "13800000002", globalRole: "user", role: "CON" },
  { id: "u-mat", username: "mat", displayName: "何材料", phone: "13800000003", globalRole: "user", role: "MAT" },
  { id: "u-safe", username: "safe", displayName: "陈安全", phone: "13800000004", globalRole: "user", role: "SAFE" },
  { id: "u-doc", username: "doc", displayName: "宋资料", phone: "13800000005", globalRole: "user", role: "DOC" },
  { id: "u-mach", username: "mach", displayName: "赵机械", phone: "13800000006", globalRole: "user", role: "MACH" },
];

export const project: Project = {
  id: "p-demo",
  name: "江湾科创中心二期总承包工程",
  code: "JWKC-2026-02",
  location: "上海市浦东新区银城路 88 号",
  owner: "江湾城市建设集团",
  contractor: "华东建设总承包有限公司",
  supervisor: "正衡工程监理有限公司",
  status: "in_progress",
  startDate: "2026-03-01",
  plannedEndDate: "2027-08-31",
};

export const dailyLogs: DailyLog[] = [
  {
    id: "dl-001",
    projectId: project.id,
    workDate: "2026-05-31",
    weather: "晴",
    tempLow: 22,
    tempHigh: 31,
    workContent: "地下室 B 区顶板混凝土浇筑完成，现场同步完成养护覆盖。",
    workPosition: "地下室 B 区",
    workProcess: "混凝土浇筑",
    laborCount: 46,
    laborDetail: [
      { type: "钢筋工", count: 12 },
      { type: "木工", count: 10 },
      { type: "混凝土工", count: 18 },
      { type: "电工", count: 6 },
    ],
    machineryUsed: ["汽车泵", "插入式振捣器", "塔吊 2#"],
    materialUsed: [
      { name: "C35 商品混凝土", quantity: 238, unit: "m3" },
      { name: "覆膜养护布", quantity: 900, unit: "m2" },
    ],
    qualityCheck: "现场取样 3 组，塌落度 180mm，满足浇筑要求。",
    safetyCheck: "临边洞口防护齐全，泵车支腿垫板符合要求。",
    status: "submitted",
    submittedBy: "林施工",
    attachments: [
      { id: "att-1", fileName: "浇筑面照片.jpg", url: "/logo.svg", fileType: "image/svg+xml", hasWatermark: true },
    ],
  },
  {
    id: "dl-002",
    projectId: project.id,
    workDate: "2026-05-30",
    weather: "阴",
    tempLow: 20,
    tempHigh: 28,
    workContent: "塔楼 A 核心筒墙柱钢筋绑扎完成 80%。",
    workPosition: "塔楼 A 8 层",
    workProcess: "钢筋绑扎",
    laborCount: 38,
    laborDetail: [
      { type: "钢筋工", count: 26 },
      { type: "测量员", count: 4 },
      { type: "普工", count: 8 },
    ],
    machineryUsed: ["塔吊 1#", "钢筋弯曲机"],
    materialUsed: [{ name: "HRB400E 钢筋", quantity: 18.6, unit: "吨" }],
    qualityCheck: "主筋规格、箍筋间距抽检合格。",
    safetyCheck: "材料码放区设置警戒线。",
    status: "approved",
    submittedBy: "林施工",
    reviewedBy: "周项目",
    reviewComment: "资料完整，照片有水印。",
    attachments: [],
  },
];

export const materials: Material[] = [
  {
    id: "mat-001",
    projectId: project.id,
    name: "HRB400E 钢筋",
    category: "钢筋",
    spec: "C16-C25",
    unit: "吨",
    safetyStock: 45,
    currentStock: 38,
    monthlyIn: 128,
    monthlyOut: 156,
  },
  {
    id: "mat-002",
    projectId: project.id,
    name: "C35 商品混凝土",
    category: "混凝土",
    spec: "P8 抗渗",
    unit: "m3",
    safetyStock: 120,
    currentStock: 520,
    monthlyIn: 1680,
    monthlyOut: 1410,
  },
  {
    id: "mat-003",
    projectId: project.id,
    name: "SBS 防水卷材",
    category: "防水",
    spec: "4mm II 型",
    unit: "m2",
    safetyStock: 800,
    currentStock: 640,
    monthlyIn: 2400,
    monthlyOut: 1760,
  },
];

export const stockIns: StockRecord[] = [
  {
    id: "si-001",
    materialId: "mat-001",
    materialName: "HRB400E 钢筋",
    billNo: "RK-20260531-001",
    quantity: 32,
    status: "submitted",
    submittedBy: "何材料",
    createdAt: "2026-05-31 09:20",
    supplier: "申钢物资",
  },
  {
    id: "si-002",
    materialId: "mat-002",
    materialName: "C35 商品混凝土",
    billNo: "RK-20260530-003",
    quantity: 238,
    status: "approved",
    submittedBy: "何材料",
    createdAt: "2026-05-30 16:40",
    supplier: "浦建商砼",
  },
];

export const stockOuts: StockRecord[] = [
  {
    id: "so-001",
    materialId: "mat-003",
    materialName: "SBS 防水卷材",
    billNo: "CK-20260531-002",
    quantity: 420,
    status: "submitted",
    submittedBy: "何材料",
    createdAt: "2026-05-31 13:10",
    receiver: "防水班组",
  },
];

export const hazards: Hazard[] = [
  {
    id: "hz-001",
    title: "基坑北侧材料临时堆放距边坡过近",
    area: "基坑北侧",
    riskLevel: "high",
    status: "rectifying",
    owner: "陈安全",
    dueDate: "2026-06-02",
  },
  {
    id: "hz-002",
    title: "8 层楼梯间临边踢脚板缺失",
    area: "塔楼 A 8 层",
    riskLevel: "medium",
    status: "open",
    owner: "陈安全",
    dueDate: "2026-06-01",
  },
];

export const machinery: Machinery[] = [
  {
    id: "mc-001",
    name: "塔吊 1#",
    code: "TC6015-01",
    operator: "张师傅",
    status: "onsite",
    nextMaintenanceDate: "2026-06-05",
    shiftsThisMonth: 21,
  },
  {
    id: "mc-002",
    name: "汽车泵",
    code: "SY5418THB",
    operator: "王师傅",
    status: "maintenance",
    nextMaintenanceDate: "2026-06-01",
    shiftsThisMonth: 12,
  },
];

export const reviewItems: ReviewItem[] = [
  {
    id: "dl-001",
    targetType: "daily-log",
    title: "地下室 B 区顶板混凝土浇筑日志",
    submittedBy: "林施工",
    submittedAt: "2026-05-31 18:20",
    status: "submitted",
    priority: "urgent",
  },
  {
    id: "si-001",
    targetType: "material",
    title: "HRB400E 钢筋入库 32 吨",
    submittedBy: "何材料",
    submittedAt: "2026-05-31 09:20",
    status: "submitted",
    priority: "normal",
  },
  {
    id: "so-001",
    targetType: "material",
    title: "SBS 防水卷材出库 420 m2",
    submittedBy: "何材料",
    submittedAt: "2026-05-31 13:10",
    status: "submitted",
    priority: "normal",
  },
];

export const dashboardSummary: DashboardSummary = {
  pendingReviews: reviewItems.filter((item) => item.status === "submitted").length,
  overdueItems: 2,
  safetyHazards: hazards.length,
  lowStockMaterials: materials.filter((item) => item.currentStock < item.safetyStock).length,
  maintenanceDue: machinery.filter((item) => item.nextMaintenanceDate <= "2026-06-05").length,
};

export function findDailyLog(id: string) {
  return dailyLogs.find((item) => item.id === id);
}

export function findMaterial(id: string) {
  return materials.find((item) => item.id === id);
}


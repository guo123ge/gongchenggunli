import type { ModuleKey, ProjectRole, ReviewStatus, RiskLevel } from "./enums";

export type User = {
  id: string;
  username: string;
  displayName: string;
  phone: string;
  globalRole: "admin" | "user";
  role: ProjectRole;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  location: string;
  owner: string;
  contractor: string;
  supervisor?: string;
  status: "preparation" | "in_progress" | "suspended" | "completed";
  startDate: string;
  plannedEndDate: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  url: string;
  fileType: string;
  hasWatermark?: boolean;
};

export type DailyLog = {
  id: string;
  projectId: string;
  workDate: string;
  weather: "晴" | "阴" | "雨" | "雪" | "大风";
  tempLow: number;
  tempHigh: number;
  workContent: string;
  workPosition: string;
  workProcess: string;
  laborCount: number;
  laborDetail: Array<{ type: string; count: number }>;
  machineryUsed: string[];
  materialUsed: Array<{ name: string; quantity: number; unit: string }>;
  qualityCheck?: string;
  safetyCheck?: string;
  status: ReviewStatus;
  submittedBy: string;
  reviewedBy?: string;
  reviewComment?: string;
  attachments: Attachment[];
};

export type Material = {
  id: string;
  projectId: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  safetyStock: number;
  currentStock: number;
  monthlyIn: number;
  monthlyOut: number;
};

export type StockRecord = {
  id: string;
  materialId: string;
  materialName: string;
  billNo: string;
  quantity: number;
  status: ReviewStatus;
  submittedBy: string;
  createdAt: string;
  supplier?: string;
  receiver?: string;
};

export type Hazard = {
  id: string;
  title: string;
  area: string;
  riskLevel: RiskLevel;
  status: "open" | "rectifying" | "reviewing" | "closed";
  owner: string;
  dueDate: string;
};

export type Machinery = {
  id: string;
  name: string;
  code: string;
  operator: string;
  status: "onsite" | "maintenance" | "offsite";
  nextMaintenanceDate: string;
  shiftsThisMonth: number;
};

export type ReviewItem = {
  id: string;
  targetType: ModuleKey;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
  priority: "normal" | "urgent";
};

export type DashboardSummary = {
  pendingReviews: number;
  overdueItems: number;
  safetyHazards: number;
  lowStockMaterials: number;
  maintenanceDue: number;
};


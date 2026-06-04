export type ProjectRole = "PM" | "CON" | "TECH" | "SAFE" | "MAT" | "DOC" | "MACH";

export type ReviewStatus = "draft" | "submitted" | "approved" | "rejected";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ModuleKey =
  | "dashboard"
  | "project"
  | "documents"
  | "daily-log"
  | "material"
  | "machinery"
  | "safety"
  | "archive"
  | "change-visa"
  | "review";

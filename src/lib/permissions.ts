import type { ModuleKey, ProjectRole } from "@/types/enums";

const moduleAccess: Record<ProjectRole, ModuleKey[]> = {
  PM: ["dashboard", "project", "documents", "daily-log", "quantity", "material", "machinery", "safety", "archive", "change-visa", "review"],
  CON: ["dashboard", "documents", "daily-log", "quantity", "material", "safety"],
  TECH: ["dashboard", "documents", "daily-log", "quantity", "archive", "change-visa"],
  SAFE: ["dashboard", "documents", "daily-log", "safety", "review"],
  MAT: ["dashboard", "documents", "material", "daily-log"],
  DOC: ["dashboard", "documents", "archive", "daily-log", "change-visa"],
  MACH: ["dashboard", "documents", "machinery", "daily-log"],
};

export function canView(module: ModuleKey, role: ProjectRole) {
  return moduleAccess[role]?.includes(module) ?? false;
}

export function canEdit(module: ModuleKey, role: ProjectRole) {
  if (role === "PM") return true;
  if (module === "review") return false;
  return canView(module, role);
}

export function canReview(role: ProjectRole) {
  return role === "PM";
}

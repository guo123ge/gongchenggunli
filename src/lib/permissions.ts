import type { ModuleKey, ProjectRole } from "@/types/enums";

const moduleAccess: Record<ProjectRole, ModuleKey[]> = {
  PM: ["dashboard", "daily-log", "material", "machinery", "safety", "archive", "change-visa", "review"],
  CON: ["dashboard", "daily-log", "material", "safety"],
  TECH: ["dashboard", "daily-log", "archive", "change-visa"],
  SAFE: ["dashboard", "daily-log", "safety", "review"],
  MAT: ["dashboard", "material", "daily-log"],
  DOC: ["dashboard", "archive", "daily-log", "change-visa"],
  MACH: ["dashboard", "machinery", "daily-log"],
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


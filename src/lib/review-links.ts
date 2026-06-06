import type { ModuleKey } from "@/types/enums";

export function getReviewTargetHref(targetType: ModuleKey, targetId: string) {
  if (targetType === "daily-log") return `/daily-log/${targetId}`;
  if (targetType === "documents") return `/documents?keyword=${encodeURIComponent(targetId)}`;
  if (targetType === "machinery") return `/machinery/${targetId}`;
  if (targetType === "safety") return `/safety/hazards/${targetId}`;
  if (targetType === "archive") return `/archive/${targetId}`;
  if (targetType === "change-visa") return `/change-visa`;
  if (targetType === "material") return `/material/records/${targetId}`;
  return "/review";
}

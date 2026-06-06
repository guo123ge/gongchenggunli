import { isPrismaBackendEnabled } from "./data-backend";
import { readPrismaStore } from "./prisma-repository";
import { readStore, type StoreData } from "./server-store";

export async function readAppData() {
  if (isPrismaBackendEnabled()) return readPrismaStore();
  const data = await readStore();
  return buildActiveProjectView(data);
}

function buildActiveProjectView(data: StoreData): StoreData {
  const activeProjectId = data.project.id;
  const materials = data.materials.filter((item) => item.projectId === activeProjectId);
  const materialIds = new Set(materials.map((item) => item.id));
  const hazards = data.hazards.filter((item) => belongsToActiveProject(item, activeProjectId));
  const machinery = data.machinery.filter((item) => belongsToActiveProject(item, activeProjectId));
  const machineIds = new Set(machinery.map((item) => item.id));
  const archives = data.archives.filter((item) => belongsToActiveProject(item, activeProjectId));
  const archiveIds = new Set(archives.map((item) => item.id));
  const changes = data.changes.filter((item) => belongsToActiveProject(item, activeProjectId));
  const visas = data.visas.filter((item) => belongsToActiveProject(item, activeProjectId));
  const dailyLogs = data.dailyLogs.filter((item) => item.projectId === activeProjectId);
  const quantities = data.quantities.filter((item) => item.projectId === activeProjectId);
  const quantityIds = new Set(quantities.map((item) => item.id));
  const incidents = data.incidents.filter((item) => belongsToActiveProject(item, activeProjectId));
  const documents = data.documents.filter((item) => item.projectId === activeProjectId);
  const visibleReviewItems = data.reviewItems.filter((item) => {
    if (item.status !== "submitted") return false;
    if (item.targetType === "daily-log") return dailyLogs.some((log) => log.id === item.id);
    if (item.targetType === "documents") return documents.some((document) => document.id === item.id);
    if (item.targetType === "material") return materialIds.has(item.id) || data.stockIns.some((record) => record.id === item.id && materialIds.has(record.materialId)) || data.stockOuts.some((record) => record.id === item.id && materialIds.has(record.materialId));
    if (item.targetType === "safety") return hazards.some((hazard) => hazard.id === item.id) || incidents.some((incident) => incident.id === item.id);
    if (item.targetType === "machinery") return machineIds.has(item.id);
    if (item.targetType === "archive") return archiveIds.has(item.id);
    if (item.targetType === "change-visa") return changes.some((change) => change.id === item.id) || visas.some((visa) => visa.id === item.id);
    return true;
  });
  const reviewKeys = new Set(visibleReviewItems.map((item) => `${item.targetType}:${item.id}`));
  const documentReviewItems = documents
    .filter((item) => item.reviewStatus === "submitted")
    .filter((item) => !reviewKeys.has(`documents:${item.id}`))
    .map((item) => ({
      id: item.id,
      targetType: "documents" as const,
      title: `资料待审核：${item.title}`,
      submittedBy: item.submittedBy,
      submittedAt: item.createdAt,
      status: item.reviewStatus,
      priority: "normal" as const,
    }));
  const inferredReviewItems = [
    ...documentReviewItems,
    ...archives
      .filter((item) => item.status === "submitted")
      .filter((item) => !reviewKeys.has(`archive:${item.id}`))
      .map((item) => ({
        id: item.id,
        targetType: "archive" as const,
        title: `档案待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.createdAt,
        status: item.status,
        priority: "normal" as const,
      })),
    ...machinery
      .filter((item) => item.status === "submitted")
      .filter((item) => !reviewKeys.has(`machinery:${item.id}`))
      .map((item) => ({
        id: item.id,
        targetType: "machinery" as const,
        title: `机械进场待审核：${item.name}`,
        submittedBy: item.operator,
        submittedAt: item.nextMaintenanceDate,
        status: item.status,
        priority: "normal" as const,
      })),
    ...incidents
      .filter((item) => item.status === "submitted")
      .filter((item) => !reviewKeys.has(`safety:${item.id}`))
      .map((item) => ({
        id: item.id,
        targetType: "safety" as const,
        title: `安全事件待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.incidentDate,
        status: "submitted" as const,
        priority: item.level === "high" || item.level === "critical" ? ("urgent" as const) : ("normal" as const),
      })),
    ...changes
      .filter((item) => item.status === "submitted")
      .filter((item) => !reviewKeys.has(`change-visa:${item.id}`))
      .map((item) => ({
        id: item.id,
        targetType: "change-visa" as const,
        title: `设计变更待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.createdAt,
        status: item.status,
        priority: "urgent" as const,
      })),
    ...visas
      .filter((item) => item.status === "submitted")
      .filter((item) => !reviewKeys.has(`change-visa:${item.id}`))
      .map((item) => ({
        id: item.id,
        targetType: "change-visa" as const,
        title: `工程签证待审核：${item.title}`,
        submittedBy: item.submittedBy,
        submittedAt: item.createdAt,
        status: item.status,
        priority: "urgent" as const,
      })),
  ];

  return {
    ...data,
    dailyLogs,
    quantities,
    quantityUpdates: data.quantityUpdates.filter((item) => item.projectId === activeProjectId && quantityIds.has(item.quantityId)),
    materials,
    stockIns: data.stockIns.filter((item) => materialIds.has(item.materialId)),
    stockOuts: data.stockOuts.filter((item) => materialIds.has(item.materialId)),
    hazards,
    incidents,
    machinery,
    maintenanceRecords: data.maintenanceRecords.filter((item) => machineIds.has(item.machineryId)),
    shiftRecords: data.shiftRecords.filter((item) => machineIds.has(item.machineryId)),
    reviewItems: [...visibleReviewItems, ...inferredReviewItems],
    archiveFiles: data.archiveFiles.filter((item) => archiveIds.has(item.archiveId)),
    documents,
    archives,
    changes,
    visas,
  };
}

function belongsToActiveProject<T extends { projectId?: string }>(item: T, activeProjectId: string) {
  return item.projectId === activeProjectId;
}

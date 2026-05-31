import { dailyLogs, hazards, materials } from "./mock-data";

export type RagHit = {
  id: string;
  source: "daily-log" | "material" | "safety";
  title: string;
  snippet: string;
  score: number;
};

export function searchProjectKnowledge(query: string): RagHit[] {
  const normalized = query.trim().toLowerCase();
  const hits: RagHit[] = [
    ...dailyLogs.map((log) => ({
      id: log.id,
      source: "daily-log" as const,
      title: `${log.workDate} ${log.workPosition}`,
      snippet: log.workContent,
      score: log.workContent.toLowerCase().includes(normalized) ? 0.92 : 0.54,
    })),
    ...materials.map((material) => ({
      id: material.id,
      source: "material" as const,
      title: material.name,
      snippet: `${material.spec} 当前库存 ${material.currentStock}${material.unit}`,
      score: material.name.toLowerCase().includes(normalized) ? 0.9 : 0.48,
    })),
    ...hazards.map((hazard) => ({
      id: hazard.id,
      source: "safety" as const,
      title: hazard.title,
      snippet: `${hazard.area} ${hazard.riskLevel} ${hazard.status}`,
      score: hazard.title.toLowerCase().includes(normalized) ? 0.88 : 0.5,
    })),
  ];

  return hits.sort((a, b) => b.score - a.score).slice(0, 5);
}


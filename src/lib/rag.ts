import { readAppData } from "./app-data";

export type RagHit = {
  id: string;
  source: "daily-log" | "material" | "safety";
  title: string;
  snippet: string;
  score: number;
};

function scoreText(text: string, query: string, fallback: number) {
  if (!query) return fallback;
  return text.toLowerCase().includes(query) ? 0.92 : fallback;
}

export async function searchProjectKnowledge(query: string): Promise<RagHit[]> {
  const normalized = query.trim().toLowerCase();
  const data = await readAppData();
  const hits: RagHit[] = [
    ...data.dailyLogs.map((log) => {
      const searchable = `${log.workDate} ${log.workPosition} ${log.workContent}`;
      return {
        id: log.id,
        source: "daily-log" as const,
        title: `${log.workDate} ${log.workPosition}`,
        snippet: log.workContent,
        score: scoreText(searchable, normalized, 0.54),
      };
    }),
    ...data.materials.map((material) => {
      const searchable = `${material.name} ${material.spec} ${material.category}`;
      return {
        id: material.id,
        source: "material" as const,
        title: material.name,
        snippet: `${material.spec} current stock ${material.currentStock}${material.unit}`,
        score: scoreText(searchable, normalized, 0.48),
      };
    }),
    ...data.hazards.map((hazard) => {
      const searchable = `${hazard.title} ${hazard.area} ${hazard.riskLevel} ${hazard.status}`;
      return {
        id: hazard.id,
        source: "safety" as const,
        title: hazard.title,
        snippet: `${hazard.area} ${hazard.riskLevel} ${hazard.status}`,
        score: scoreText(searchable, normalized, 0.5),
      };
    }),
  ];

  return hits.sort((a, b) => b.score - a.score).slice(0, 5);
}

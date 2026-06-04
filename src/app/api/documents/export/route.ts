import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const data = await readAppData();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "csv" ? "csv" : "json";
  const filters = {
    ids: searchParams.get("ids") ?? "",
    keyword: searchParams.get("keyword") ?? "",
    module: searchParams.get("module") ?? "",
    role: searchParams.get("role") ?? "",
    aiStatus: searchParams.get("aiStatus") ?? "",
  };

  const documents = filterDocuments(data.documents, filters);

  if (format === "csv") {
    const rows = [
      ["标题", "模块", "文件名", "提交人", "角色", "AI状态", "来源", "归档人", "归档时间", "创建时间", "地址"].join(","),
      ...documents.map((item) =>
        [
          safeCsv(item.title),
          safeCsv(item.module),
          safeCsv(item.fileName),
          safeCsv(item.submittedBy),
          safeCsv(item.submittedRole),
          safeCsv(item.aiReviewStatus),
          safeCsv(item.sourceType ?? "file"),
          safeCsv(item.archivedBy ?? ""),
          safeCsv(item.archivedAt ?? ""),
          safeCsv(item.createdAt),
          safeCsv(item.url),
        ].join(","),
      ),
    ].join("\n");

    return new Response(`\uFEFF${rows}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="documents-export.csv"',
      },
    });
  }

  return new Response(JSON.stringify(documents, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="documents-export.json"',
    },
  });
}

function filterDocuments(
  documents: Awaited<ReturnType<typeof readAppData>>["documents"],
  filters: { ids: string; keyword: string; module: string; role: string; aiStatus: string },
) {
  const idSet = new Set(
    filters.ids
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const keyword = filters.keyword.trim().toLowerCase();
  return documents.filter((item) => {
    if (idSet.size > 0 && !idSet.has(item.id)) return false;
    if (filters.module && item.module !== filters.module) return false;
    if (filters.role && item.submittedRole !== filters.role) return false;
    if (filters.aiStatus && item.aiReviewStatus !== filters.aiStatus) return false;
    if (!keyword) return true;
    const haystack = `${item.title} ${item.fileName} ${item.submittedBy} ${item.aiSummary ?? ""}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

function safeCsv(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

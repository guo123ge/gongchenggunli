import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  module: string;
  title: string;
  description: string;
  href: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  riskLevel?: "low" | "medium" | "high" | "critical";
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();
  const data = await readAppData();
  const results = keyword ? buildSearchResults(data, keyword) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand">全局搜索</p>
        <h1 className="mt-2 text-3xl font-black text-white">搜索结果</h1>
        <p className="mt-2 text-muted">
          {keyword ? `关键词：${keyword}，共找到 ${results.length} 条结果。` : "请输入关键词后从顶部搜索框发起查询。"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>匹配记录</CardTitle>
            <CardDescription>搜索范围包括施工日志、材料、隐患、机械、档案、变更和签证。</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {results.map((item) => (
            <Link key={`${item.module}-${item.id}`} href={item.href} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-panel/60 p-4 transition hover:border-brand/60">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand">{item.module}</p>
                <p className="mt-1 truncate font-semibold text-white">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {item.status && <StatusBadge status={item.status} />}
                {item.riskLevel && <RiskBadge level={item.riskLevel} />}
                <ArrowRight className="size-4 text-muted" />
              </div>
            </Link>
          ))}
          {keyword && results.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              <Search className="mx-auto mb-3 size-8 opacity-70" />
              <p>未找到匹配记录，请尝试更换关键词。</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function buildSearchResults(data: Awaited<ReturnType<typeof readAppData>>, keyword: string): SearchResult[] {
  const results: SearchResult[] = [];

  addIfMatch(results, keyword, {
    id: data.project.id,
    module: "当前项目",
    title: data.project.name,
    description: `${data.project.location} / 建设单位 ${data.project.owner} / 施工单位 ${data.project.contractor}`,
    href: "/projects",
  });

  data.dailyLogs.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "施工日志",
      title: `${item.workDate} ${item.workPosition}`,
      description: `${item.workProcess} / ${item.workContent}`,
      href: `/daily-log/${item.id}`,
      status: item.status,
    });
  });

  data.materials.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "材料",
      title: item.name,
      description: `${item.category} / ${item.spec} / 当前库存 ${item.currentStock}${item.unit}`,
      href: "/material",
    });
  });

  [...data.stockIns, ...data.stockOuts].forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "材料单据",
      title: `${item.materialName} ${item.billNo}`,
      description: `数量 ${item.quantity} / 提交人 ${item.submittedBy}`,
      href: `/material/records/${item.id}`,
      status: item.status,
    });
  });

  data.hazards.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "安全隐患",
      title: item.title,
      description: `${item.area} / 责任人 ${item.owner} / 截止 ${item.dueDate}`,
      href: `/safety/hazards/${item.id}`,
      riskLevel: item.riskLevel,
    });
  });

  data.machinery.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "机械",
      title: item.name,
      description: `${item.code} / 操作手 ${item.operator} / 下次保养 ${item.nextMaintenanceDate}`,
      href: `/machinery/${item.id}`,
      status: item.status,
    });
  });

  data.archives.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "档案",
      title: item.title,
      description: `${item.category} / ${item.version} / ${item.tags.join("、")}`,
      href: `/archive/${item.id}`,
      status: item.status,
    });
  });

  data.documents.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "资料库",
      title: item.title,
      description: `${item.fileName} / 提交人 ${item.submittedBy}`,
      href: item.url,
      status: item.reviewStatus,
    });
  });

  data.changes.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "变更",
      title: item.title,
      description: `${item.reason} / 预计费用 ${item.estimatedCost}`,
      href: `/change-visa/changes/${item.id}`,
      status: item.status,
    });
  });

  data.visas.forEach((item) => {
    addIfMatch(results, keyword, {
      id: item.id,
      module: "签证",
      title: item.title,
      description: `${item.visaType} / 金额 ${item.totalAmount}`,
      href: `/change-visa/visas/${item.id}`,
      status: item.status,
    });
  });

  return results;
}

function addIfMatch(results: SearchResult[], keyword: string, item: SearchResult) {
  const haystack = `${item.module} ${item.title} ${item.description}`.toLowerCase();
  if (haystack.includes(keyword.toLowerCase())) results.push(item);
}

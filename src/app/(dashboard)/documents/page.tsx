import { Archive, BrainCircuit, Files, PieChart } from "lucide-react";
import { auth } from "@/lib/auth";
import { DocumentBulkPanel } from "@/components/documents/document-bulk-panel";
import { DocumentDeleteButton } from "@/components/documents/document-delete-button";
import { DocumentOpenButton } from "@/components/documents/document-open-button";
import { DocumentReviewButton } from "@/components/documents/document-review-button";
import { DocumentsFilterBar } from "@/components/documents/documents-filter-bar";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULE_LABELS, ROLE_LABELS } from "@/lib/constants";
import { readAppData } from "@/lib/app-data";
import type { DocumentRecord } from "@/types";
import type { ProjectRole } from "@/types/enums";

export const dynamic = "force-dynamic";

const aiStatusLabel = {
  pending: "待审查",
  passed: "已通过",
  warning: "需关注",
  failed: "未通过",
};

const sourceTypeLabel = {
  image: "图片资料",
  audio: "语音资料",
  file: "文件资料",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; module?: string; role?: string; aiStatus?: string }>;
}) {
  const session = await auth();
  const currentRole = (session?.user?.role ?? "CON") as ProjectRole;
  const canDeleteDocument = currentRole === "PM";
  const data = await readAppData();
  const visibleDocuments = data.documents.filter((item) => !item.visibilityRoles || item.visibilityRoles.includes(currentRole));
  const { keyword = "", module = "", role = "", aiStatus = "" } = await searchParams;
  const documents = filterDocuments(visibleDocuments, { keyword, module, role, aiStatus });

  const stats = {
    total: visibleDocuments.length,
    pending: visibleDocuments.filter((item) => item.aiReviewStatus === "pending").length,
    warning: visibleDocuments.filter((item) => item.aiReviewStatus === "warning").length,
    passed: visibleDocuments.filter((item) => item.aiReviewStatus === "passed").length,
    archived: visibleDocuments.filter((item) => item.archivedAt).length,
  };

  const moduleStats = summarizeByModule(visibleDocuments);
  const roleStats = summarizeByRole(visibleDocuments);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand">资料库</p>
        <h1 className="mt-2 text-3xl font-black text-white">项目资料集中库</h1>
        <p className="mt-2 text-muted">各角色提交的照片、语音、报告、表单和附件统一集中保存，可筛选、导出、AI 审查、访问留痕和批量归档。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="资料总数" value={stats.total} />
        <StatCard label="待审查" value={stats.pending} />
        <StatCard label="需关注" value={stats.warning} />
        <StatCard label="已通过" value={stats.passed} />
        <StatCard label="已归档" value={stats.archived} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="size-4 text-brand" />
                模块分布
              </CardTitle>
              <CardDescription>按所属模块统计资料数量。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {moduleStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-panel/60 px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
            {moduleStats.length === 0 && <p className="text-sm text-muted">暂无模块统计。</p>}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Files className="size-4 text-brand" />
                角色分布
              </CardTitle>
              <CardDescription>按提交角色统计资料数量。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {roleStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-panel/60 px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
            {roleStats.length === 0 && <p className="text-sm text-muted">暂无角色统计。</p>}
          </div>
        </Card>
      </div>

      <DocumentsFilterBar
        moduleOptions={[{ value: "", label: "全部模块" }, ...Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label }))]}
        roleOptions={[{ value: "", label: "全部角色" }, ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))]}
        aiStatusOptions={[
          { value: "", label: "全部 AI 状态" },
          { value: "pending", label: "待审查" },
          { value: "passed", label: "已通过" },
          { value: "warning", label: "需关注" },
          { value: "failed", label: "未通过" },
        ]}
      />

      <DocumentUploadForm />
      <DocumentBulkPanel documents={documents} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>资料清单</CardTitle>
            <CardDescription>筛选后共 {documents.length} 份资料。项目经理可删除资料库中的资料记录。</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {documents.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-panel/60 p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div className="min-w-0">
                  <p className="text-xs text-brand">{MODULE_LABELS[item.module]}</p>
                  <h3 className="mt-1 truncate text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {item.fileName} / {formatFileSize(item.fileSize)} / {item.createdAt}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    提交人 {item.submittedBy} / 角色 {ROLE_LABELS[item.submittedRole]} / 存储 {storageLabel(item.storageProvider)} / 来源 {sourceTypeLabel[item.sourceType ?? "file"]}
                  </p>
                  <p className="mt-1 text-xs text-muted">可见范围：{formatVisibilityRoles(item.visibilityRoles)}</p>
                  {item.archivedAt && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-brand">
                      <Archive className="size-3" />
                      已由 {item.archivedBy ?? "当前用户"} 于 {item.archivedAt} 归档
                    </p>
                  )}
                  {item.aiSummary && <p className="mt-2 rounded-xl bg-panel-soft p-3 text-sm text-slate-200">{item.aiSummary}</p>}
                  {item.accessLogs && item.accessLogs.length > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      最近访问：{item.accessLogs[0].userName} / {ROLE_LABELS[item.accessLogs[0].userRole]} / {item.accessLogs[0].action === "download" ? "下载" : "查看"} /{" "}
                      {item.accessLogs[0].createdAt}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.reviewStatus} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    <BrainCircuit className="size-3" />
                    {aiStatusLabel[item.aiReviewStatus]}
                  </span>
                  <DocumentReviewButton id={item.id} title={item.title} fileName={item.fileName} sourceType={item.sourceType} />
                  <DocumentOpenButton id={item.id} url={item.url} />
                  {canDeleteDocument && <DocumentDeleteButton id={item.id} title={item.title} />}
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              <Files className="mx-auto mb-3 size-8 opacity-70" />
              <p>当前筛选条件下暂无资料。</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-panel/70 p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function filterDocuments(documents: DocumentRecord[], filters: { keyword: string; module: string; role: string; aiStatus: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return documents.filter((item) => {
    if (filters.module && item.module !== filters.module) return false;
    if (filters.role && item.submittedRole !== filters.role) return false;
    if (filters.aiStatus && item.aiReviewStatus !== filters.aiStatus) return false;
    if (!keyword) return true;
    const haystack = `${item.title} ${item.fileName} ${item.submittedBy} ${item.aiSummary ?? ""}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

function summarizeByModule(documents: DocumentRecord[]) {
  const counts = new Map<string, number>();
  for (const item of documents) {
    counts.set(MODULE_LABELS[item.module], (counts.get(MODULE_LABELS[item.module]) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

function summarizeByRole(documents: DocumentRecord[]) {
  const counts = new Map<string, number>();
  for (const item of documents) {
    counts.set(ROLE_LABELS[item.submittedRole], (counts.get(ROLE_LABELS[item.submittedRole]) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

function formatVisibilityRoles(roles?: ProjectRole[]) {
  const visibleRoles: ProjectRole[] = roles && roles.length > 0 ? roles : ["PM", "CON", "TECH", "SAFE", "MAT", "DOC", "MACH"];
  return visibleRoles.map((item) => ROLE_LABELS[item]).join("、");
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function storageLabel(provider: string) {
  if (provider === "tencent-cos") return "腾讯云 COS";
  if (provider === "vercel-blob") return "Vercel Blob";
  return "本地 uploads";
}

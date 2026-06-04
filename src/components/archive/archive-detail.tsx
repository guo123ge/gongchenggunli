import { StatusBadge } from "@/components/shared/status-badge";
import type { ArchiveRecord } from "@/types";

export function ArchiveDetail({ archive }: { archive?: ArchiveRecord }) {
  if (!archive) {
    return <div className="rounded-2xl border border-dashed border-border bg-panel-soft p-4 text-sm text-muted">未找到对应档案记录，可能已被删除或不属于当前项目。</div>;
  }

  return (
    <div className="grid gap-3 text-sm md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-panel-soft p-4">
        <p className="text-muted">档案分类</p>
        <p className="mt-1 font-semibold text-white">{archive.category}</p>
      </div>
      <div className="rounded-2xl border border-border bg-panel-soft p-4">
        <p className="text-muted">当前版本</p>
        <p className="mt-1 font-semibold text-white">{archive.version}</p>
      </div>
      <div className="rounded-2xl border border-border bg-panel-soft p-4">
        <p className="text-muted">提交人</p>
        <p className="mt-1 font-semibold text-white">{archive.submittedBy}</p>
      </div>
      <div className="rounded-2xl border border-border bg-panel-soft p-4">
        <p className="text-muted">提交时间</p>
        <p className="mt-1 font-semibold text-white">{archive.createdAt}</p>
      </div>
      <div className="rounded-2xl border border-border bg-panel-soft p-4 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-muted">标签</p>
            <p className="mt-1 font-semibold text-white">{archive.tags.join("、") || "暂无标签"}</p>
          </div>
          <StatusBadge status={archive.status} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Archive, BrainCircuit, Download, Square, SquareCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentRecord } from "@/types";

type BulkPanelProps = {
  documents: DocumentRecord[];
};

export function DocumentBulkPanel({ documents }: BulkPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = documents.length > 0 && documents.every((item) => selectedSet.has(item.id));

  function toggleAll() {
    setSelectedIds(allSelected ? [] : documents.map((item) => item.id));
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function batchReview() {
    if (selectedIds.length === 0) {
      toast.error("请先选择需要审查的资料。");
      return;
    }

    const response = await fetch("/api/documents/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: selectedIds,
        aiReviewStatus: "warning",
        summary: `AI 已完成批量资料审查。本次共审查 ${selectedIds.length} 份资料，请重点核对资料完整性、签章日期、项目名称、附件一致性和后续审批要求。`,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "批量 AI 审查失败。"));
      return;
    }

    toast.success(`已完成 ${body.data?.updated ?? selectedIds.length} 份资料的 AI 审查。`);
    startTransition(() => window.location.reload());
  }

  async function batchArchive() {
    if (selectedIds.length === 0) {
      toast.error("请先选择需要归档的资料。");
      return;
    }

    const response = await fetch("/api/documents/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, action: "archive" }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(String(body.error ?? "批量归档失败。"));
      return;
    }

    toast.success(`已归档 ${body.data?.updated ?? selectedIds.length} 份资料。`);
    startTransition(() => window.location.reload());
  }

  function exportSelected(format: "json" | "csv") {
    if (selectedIds.length === 0) {
      toast.error("请先选择需要导出的资料。");
      return;
    }
    const params = new URLSearchParams();
    params.set("format", format);
    params.set("ids", selectedIds.join(","));
    window.open(`/api/documents/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="rounded-3xl border border-border bg-panel/70 p-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-white">批量处理</p>
          <p className="mt-1 text-xs text-muted">已选择 {selectedIds.length} 份资料，可批量审查、导出或归档。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={toggleAll}>
            {allSelected ? <SquareCheckBig className="size-4" /> : <Square className="size-4" />}
            {allSelected ? "取消全选" : "全选当前列表"}
          </Button>
          <Button type="button" className="gap-2" disabled={isPending || selectedIds.length === 0} onClick={batchReview}>
            <BrainCircuit className="size-4" />
            批量 AI 审查
          </Button>
          <Button type="button" variant="secondary" className="gap-2" disabled={selectedIds.length === 0} onClick={() => exportSelected("json")}>
            <Download className="size-4" />
            导出 JSON
          </Button>
          <Button type="button" variant="secondary" className="gap-2" disabled={selectedIds.length === 0} onClick={() => exportSelected("csv")}>
            <Download className="size-4" />
            导出 CSV
          </Button>
          <Button type="button" variant="secondary" className="gap-2" disabled={isPending || selectedIds.length === 0} onClick={batchArchive}>
            <Archive className="size-4" />
            批量归档
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((item) => (
          <label key={item.id} className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-panel/60 px-3 py-2 text-sm transition hover:border-brand/60">
            <input type="checkbox" className="size-4 accent-brand" checked={selectedSet.has(item.id)} onChange={() => toggleOne(item.id)} />
            <span className="truncate text-slate-200">{item.title}</span>
          </label>
        ))}
        {documents.length === 0 && <p className="text-sm text-muted">当前筛选条件下暂无可批量处理的资料。</p>}
      </div>
    </div>
  );
}

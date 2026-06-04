"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Filter, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterBarProps = {
  moduleOptions: Array<{ value: string; label: string }>;
  roleOptions: Array<{ value: string; label: string }>;
  aiStatusOptions: Array<{ value: string; label: string }>;
};

export function DocumentsFilterBar({ moduleOptions, roleOptions, aiStatusOptions }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialValues = useMemo(
    () => ({
      keyword: searchParams.get("keyword") ?? "",
      module: searchParams.get("module") ?? "",
      role: searchParams.get("role") ?? "",
      aiStatus: searchParams.get("aiStatus") ?? "",
    }),
    [searchParams],
  );

  const [keyword, setKeyword] = useState(initialValues.keyword);
  const [moduleValue, setModuleValue] = useState(initialValues.module);
  const [roleValue, setRoleValue] = useState(initialValues.role);
  const [aiStatusValue, setAiStatusValue] = useState(initialValues.aiStatus);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    setOrDelete(params, "keyword", keyword.trim());
    setOrDelete(params, "module", moduleValue);
    setOrDelete(params, "role", roleValue);
    setOrDelete(params, "aiStatus", aiStatusValue);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function resetFilters() {
    setKeyword("");
    setModuleValue("");
    setRoleValue("");
    setAiStatusValue("");
    startTransition(() => router.push(pathname));
  }

  function exportDocuments(format: "json" | "csv") {
    const params = new URLSearchParams(searchParams.toString());
    setOrDelete(params, "keyword", keyword.trim());
    setOrDelete(params, "module", moduleValue);
    setOrDelete(params, "role", roleValue);
    setOrDelete(params, "aiStatus", aiStatusValue);
    params.set("format", format);
    window.open(`/api/documents/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="rounded-3xl border border-border bg-panel/70 p-4">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto_auto_auto_auto]">
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索资料标题、文件名、提交人" />
        <select
          value={moduleValue}
          onChange={(event) => setModuleValue(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
        >
          {moduleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={roleValue}
          onChange={(event) => setRoleValue(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
        >
          {roleOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={aiStatusValue}
          onChange={(event) => setAiStatusValue(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm text-foreground outline-none transition focus:border-brand"
        >
          {aiStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <Button type="button" className="gap-2" disabled={isPending} onClick={applyFilters}>
          <Filter className="size-4" />
          {isPending ? "筛选中" : "筛选"}
        </Button>
        <Button type="button" variant="secondary" className="gap-2" disabled={isPending} onClick={resetFilters}>
          <RotateCcw className="size-4" />
          重置
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={() => exportDocuments("json")}>
          <Download className="size-4" />
          JSON
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={() => exportDocuments("csv")}>
          <Download className="size-4" />
          CSV
        </Button>
      </div>
    </div>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

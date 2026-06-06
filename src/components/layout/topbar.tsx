"use client";

import Link from "next/link";
import { Bell, Menu, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { GlobalSearchBox } from "@/components/layout/global-search-box";
import { Button } from "@/components/ui/button";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import type { DashboardSummary, Project } from "@/types";

type Notice = {
  id: string;
  title: string;
  type: "review" | "stock" | "safety" | "maintenance";
  read: boolean;
  href: string;
};

const noticeTypeLabel: Record<Notice["type"], string> = {
  review: "审核",
  stock: "库存",
  safety: "安全",
  maintenance: "保养",
};

export function Topbar({
  currentUserName,
  project,
  summary,
}: {
  currentUserName: string;
  project: Project;
  summary: DashboardSummary;
}) {
  const { online, lastSync } = useOfflineSync();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  async function toggleNotifications() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (!nextOpen || notices.length > 0) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: Notice[]; error?: string };
      if (!response.ok || body.ok === false || !body.data) {
        throw new Error(body.error ?? "通知加载失败");
      }
      setNotices(body.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "通知加载失败");
    } finally {
      setLoading(false);
    }
  }

  const noticeCount = notices.length || summary.pendingReviews;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/70 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" className="size-10 p-0 lg:hidden" aria-label="打开菜单">
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{project.location}</p>
            <h2 className="truncate text-lg font-bold text-white">{project.name}</h2>
          </div>
        </div>

        <GlobalSearchBox />

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-panel-soft px-3 py-2 text-xs text-muted sm:flex">
            {online ? <Wifi className="size-3 text-success" /> : <WifiOff className="size-3 text-danger" />}
            {online ? `在线${lastSync ? ` / 上次同步 ${lastSync}` : ""}` : "离线"}
          </div>

          <div className="relative" ref={panelRef}>
            <Button type="button" variant="secondary" className="relative size-10 p-0" aria-expanded={open} aria-label="查看通知" onClick={toggleNotifications}>
              <Bell className="size-4" />
              {noticeCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-danger text-[10px] text-white">
                  {noticeCount}
                </span>
              )}
            </Button>

            {open && (
              <div className="absolute right-0 top-12 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-panel p-3 shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="font-semibold text-white">通知提醒</p>
                    <p className="mt-1 text-xs text-muted">点击通知进入对应处理页面</p>
                  </div>
                  <Button type="button" variant="ghost" className="size-8 p-0" aria-label="关闭通知" onClick={() => setOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="mt-3 max-h-80 space-y-2 overflow-auto">
                  {loading && <p className="rounded-xl bg-panel-soft p-3 text-sm text-muted">通知加载中...</p>}
                  {error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
                  {!loading && !error && notices.length === 0 && <p className="rounded-xl bg-panel-soft p-3 text-sm text-muted">暂无新的通知。</p>}
                  {!loading &&
                    !error &&
                    notices.map((notice) => (
                      <Link
                        key={notice.id}
                        href={notice.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl border border-border bg-panel-soft p-3 transition hover:border-brand/70 hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <p className="text-xs text-brand">{noticeTypeLabel[notice.type]}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-100">{notice.title}</p>
                        <p className="mt-2 text-xs text-muted">点击查看处理</p>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden rounded-2xl border border-border bg-panel-soft px-3 py-2 text-sm sm:block">
            <span className="text-muted">您好，</span>
            <span className="font-semibold text-white">{currentUserName}</span>
          </div>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}

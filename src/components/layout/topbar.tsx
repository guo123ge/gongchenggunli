"use client";

import { Bell, Menu, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import type { DashboardSummary, Project } from "@/types";

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

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/70 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" className="size-10 p-0 lg:hidden">
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.2em] text-muted">{project.location}</p>
            <h2 className="truncate text-lg font-bold text-white">{project.name}</h2>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 items-center rounded-2xl border border-border bg-panel px-3 py-2 md:flex">
          <Search className="mr-2 size-4 text-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            placeholder="Search logs, materials, hazards, archives..."
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-panel-soft px-3 py-2 text-xs text-muted sm:flex">
            {online ? <Wifi className="size-3 text-success" /> : <WifiOff className="size-3 text-danger" />}
            {online ? `Online${lastSync ? ` / synced ${lastSync}` : ""}` : "Offline"}
          </div>
          <Button variant="secondary" className="relative size-10 p-0">
            <Bell className="size-4" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-danger text-[10px] text-white">
              {summary.pendingReviews}
            </span>
          </Button>
          <div className="hidden rounded-2xl border border-border bg-panel-soft px-3 py-2 text-sm sm:block">
            <span className="text-muted">Hi, </span>
            <span className="font-semibold text-white">{currentUserName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

export function DraftIndicator({ saving }: { saving: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-panel-soft px-3 py-1 text-xs text-muted">
      {saving ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 text-success" />}
      {saving ? "草稿保存中" : "草稿已自动保存"}
    </span>
  );
}


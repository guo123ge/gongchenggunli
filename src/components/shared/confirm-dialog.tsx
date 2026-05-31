"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  description,
  onConfirm,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-panel-soft p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <Button className="mt-4" onClick={onConfirm}>
        确认
      </Button>
    </div>
  );
}


"use client";

import { DAILY_LOG_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function TemplateSelector({
  onSelect,
}: {
  onSelect: (template: (typeof DAILY_LOG_TEMPLATES)[number]) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {DAILY_LOG_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          className="rounded-2xl border border-border bg-panel-soft p-4 text-left transition hover:border-brand/60"
          onClick={() => onSelect(template)}
        >
          <p className="font-semibold text-white">{template.name}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{template.workContent}</p>
          <Button type="button" variant="ghost" className="mt-3 px-0 text-brand">
            套用模板
          </Button>
        </button>
      ))}
    </div>
  );
}


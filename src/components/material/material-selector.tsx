"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { materials } from "@/lib/mock-data";

export function MaterialSelector({ onSelect }: { onSelect?: (id: string) => void }) {
  const [selected, setSelected] = useState(materials[0]?.id ?? "");

  return (
    <div>
      <Label>选择材料</Label>
      <select
        value={selected}
        onChange={(event) => {
          setSelected(event.target.value);
          onSelect?.(event.target.value);
        }}
        className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm outline-none focus:border-brand"
      >
        {materials.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} / {item.spec} / 当前 {item.currentStock} {item.unit}
          </option>
        ))}
      </select>
      <Input className="mt-3" placeholder="搜索材料名称、规格或分类" />
    </div>
  );
}


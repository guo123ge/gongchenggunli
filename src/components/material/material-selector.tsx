"use client";

import { useEffect, useState } from "react";
import { Input, Label } from "@/components/ui/input";
import type { Material } from "@/types";

export function MaterialSelector({ onSelect }: { onSelect?: (id: string) => void }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMaterials() {
      setIsLoading(true);
      const response = await fetch("/api/materials", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: Material[] };
      if (!isMounted) return;

      const nextMaterials = body.ok && Array.isArray(body.data) ? body.data : [];
      const nextSelected = nextMaterials[0]?.id ?? "";
      setMaterials(nextMaterials);
      setSelected(nextSelected);
      if (nextSelected) onSelect?.(nextSelected);
      setIsLoading(false);
    }

    loadMaterials().catch(() => {
      if (!isMounted) return;
      setMaterials([]);
      setSelected("");
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [onSelect]);

  return (
    <div>
      <Label>Select material</Label>
      <select
        value={selected}
        disabled={isLoading || materials.length === 0}
        onChange={(event) => {
          setSelected(event.target.value);
          onSelect?.(event.target.value);
        }}
        className="h-11 w-full rounded-xl border border-border bg-panel px-3 text-sm outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && <option value="">Loading materials...</option>}
        {!isLoading && materials.length === 0 && <option value="">No materials available</option>}
        {materials.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} / {item.spec} / stock {item.currentStock} {item.unit}
          </option>
        ))}
      </select>
      <Input className="mt-3" placeholder="Search by material name, spec, or category" />
    </div>
  );
}

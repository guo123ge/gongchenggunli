"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function ManualDateInput({ defaultValue = "", placeholder = "日期，如 20260531" }: { defaultValue?: string; placeholder?: string }) {
  const [value, setValue] = useState(formatDateInput(defaultValue));

  return (
    <Input
      type="text"
      inputMode="numeric"
      maxLength={10}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(formatDateInput(event.target.value))}
      aria-label="日期筛选"
    />
  );
}

function formatDateInput(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

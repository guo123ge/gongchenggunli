"use client";

import { Input } from "@/components/ui/input";

type ManualDateInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export function ManualDateInput({ value, defaultValue = "", onChange, placeholder = "日期，如 20260531" }: ManualDateInputProps) {
  const currentValue = value ?? defaultValue;
  return (
    <Input
      type="text"
      inputMode="numeric"
      maxLength={10}
      placeholder={placeholder}
      value={formatDateInput(currentValue)}
      onChange={(event) => onChange?.(formatDateInput(event.target.value))}
      aria-label="日期输入"
      readOnly={!onChange}
    />
  );
}

export function normalizeManualDate(value: string) {
  return value.replace(/\//g, "-");
}

function formatDateInput(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

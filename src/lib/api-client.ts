import type { ApiResponse } from "@/types/api";

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.ok) throw new Error(body.error);
  return body.data;
}

export async function apiPost<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.ok) throw new Error(body.error);
  return body.data;
}


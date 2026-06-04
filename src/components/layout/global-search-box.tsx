"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function GlobalSearchBox() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = keyword.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden max-w-md flex-1 items-center rounded-2xl border border-border bg-panel px-3 py-2 md:flex">
      <button type="submit" className="mr-2 text-muted transition hover:text-brand" aria-label="搜索">
        <Search className="size-4" />
      </button>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        placeholder="搜索日志、材料、隐患、档案..."
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        aria-label="全局搜索"
      />
    </form>
  );
}

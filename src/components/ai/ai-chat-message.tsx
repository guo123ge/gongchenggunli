export function AiChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  return <div className={role === "user" ? "rounded-2xl bg-brand px-3 py-2 text-sm text-black" : "rounded-2xl bg-panel-soft px-3 py-2 text-sm text-slate-200"}>{content}</div>;
}


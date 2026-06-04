"use client";

import { Bot, Camera, CheckCircle2, FileText, MessageSquareText, Mic, Send, Sparkles, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiChatMessage } from "./ai-chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModuleKey } from "@/types/enums";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AssistantAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "可以向我咨询行业规范、现场做法、安全隐患、材料价格口径，也可以上传照片、语音或资料让我协助审查。",
  },
];

const promptOptions = [
  "技术员拍照后，帮我判断现场做法是否符合规范",
  "安全员拍照后，帮我识别是否存在安全隐患",
  "材料员上传材料照片，帮我给出询价和价格核验建议",
  "资料员上传方案或报告，帮我做资料完整性审查",
];

export function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [attachments, setAttachments] = useState<AssistantAttachment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function appendToMessage(id: string, chunk: string) {
    setMessages((current) => current.map((item) => (item.id === id ? { ...item, content: item.content + chunk } : item)));
  }

  async function ask(question: string, providedAttachments = attachments) {
    const trimmed = question.trim();
    if ((!trimmed && providedAttachments.length === 0) || loading) return;

    const assistantId = crypto.randomUUID();
    const attachmentText = providedAttachments.length > 0 ? `\n\n已附加 ${providedAttachments.length} 个文件：${providedAttachments.map((item) => item.fileName).join("、")}` : "";
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: `${trimmed || "请审查附件"}${attachmentText}` },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, attachments: providedAttachments }),
      });

      if (!response.ok || !response.body) {
        throw new Error("智能助手暂时无法回答。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        appendToMessage(assistantId, decoder.decode(value, { stream: true }));
      }

      const tail = decoder.decode();
      if (tail) appendToMessage(assistantId, tail);
    } catch (error) {
      appendToMessage(assistantId, error instanceof Error ? error.message : "智能助手暂时无法回答。");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await ask(input);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const uploaded: AssistantAttachment[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("title", file.name);
      formData.set("module", inferModule(file));
      formData.set("registerDocument", "true");

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) {
        toast.error(`${file.name} 上传失败`);
        continue;
      }
      uploaded.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        url: body.data?.url,
      });
    }
    if (uploaded.length > 0) {
      setAttachments((current) => [...current, ...uploaded]);
      toast.success("附件已上传并进入资料库。");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function testAssistant() {
    if (loading || testStatus === "checking") return;
    setTestStatus("checking");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "测试智能助手是否可用" }),
      });
      if (!response.ok || !response.body) throw new Error("测试失败");
      await response.body.cancel();
      setTestStatus("ok");
    } catch {
      setTestStatus("error");
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-l-2xl border border-r-0 border-brand/40 bg-panel/95 px-3 py-4 text-brand shadow-2xl transition hover:bg-panel-soft xl:flex"
          aria-label="打开智能现场助手"
        >
          <Bot className="size-6" />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 hidden w-[32rem] max-w-[calc(100vw-2rem)] border-l border-border bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 xl:flex xl:flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand text-black">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-white">智能现场助手</p>
              <p className="text-xs text-muted">规范咨询、拍照问答、语音问答、资料审查</p>
            </div>
          </div>
          <Button type="button" variant="ghost" className="size-9 p-0" aria-label="关闭智能助手" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">快捷提示词</p>
            <Button type="button" variant="secondary" className="h-8 gap-2 px-3 text-xs" onClick={testAssistant} disabled={testStatus === "checking"}>
              <CheckCircle2 className="size-3.5" />
              {testStatus === "checking" ? "测试中" : "测试助手"}
            </Button>
          </div>
          <div className="mt-3 grid gap-2">
            {promptOptions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => ask(prompt)}
                disabled={loading}
                className="rounded-2xl border border-border bg-panel px-3 py-2 text-left text-xs text-slate-200 transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
          {testStatus === "ok" && <p className="mt-2 text-xs text-success">智能助手接口可用。</p>}
          {testStatus === "error" && <p className="mt-2 text-xs text-danger">智能助手接口不可用，请稍后重试。</p>}
        </div>

        <div className="border-b border-border px-5 py-3">
          <input ref={fileInputRef} type="file" accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx" multiple hidden onChange={(event) => void handleFiles(event.target.files)} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="h-8 gap-2 px-3 text-xs" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="size-3.5" />
              上传照片/语音/资料
            </Button>
            <Button type="button" variant="ghost" className="h-8 gap-2 px-3 text-xs" onClick={() => ask("请对已上传资料进行完整性和合规性审查")}>
              <FileText className="size-3.5" />
              资料审查
            </Button>
            <Button type="button" variant="ghost" className="h-8 gap-2 px-3 text-xs" onClick={() => ask("请根据现场照片判断是否符合安全规范")}>
              <Camera className="size-3.5" />
              拍照问安全
            </Button>
            <Button type="button" variant="ghost" className="h-8 gap-2 px-3 text-xs" onClick={() => ask("请根据语音问题回答现场管理建议")}>
              <Mic className="size-3.5" />
              语音问答
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <span key={file.id} className="rounded-full border border-border bg-panel px-2.5 py-1 text-xs text-muted">
                  {file.fileName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
          {messages.map((message) => (
            <AiChatMessage key={message.id} role={message.role} content={message.content || "正在生成分析..."} />
          ))}
        </div>

        <form className="border-t border-border p-4" onSubmit={submit}>
          <div className="flex gap-2">
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入问题，例如：这张现场照片是否符合安全规范" className="h-11" />
            <Button type="submit" className="size-11 shrink-0 p-0" disabled={loading || (!input.trim() && attachments.length === 0)} aria-label="发送问题">
              {loading ? <MessageSquareText className="size-4 animate-pulse" /> : <Send className="size-4" />}
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}

function inferModule(file: File): ModuleKey {
  if (file.type.startsWith("image/")) return "documents";
  if (file.type.startsWith("audio/")) return "documents";
  return "archive";
}

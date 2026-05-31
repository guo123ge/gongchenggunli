import { AiChatMessage } from "./ai-chat-message";

export function AiChatPanel() {
  return (
    <div className="fixed bottom-24 right-6 z-20 hidden w-80 rounded-3xl border border-border bg-panel/95 p-4 shadow-2xl xl:block">
      <p className="font-semibold text-white">AI 现场助手</p>
      <div className="mt-3 space-y-2">
        <AiChatMessage role="assistant" content="可以问我：今天有哪些待审？哪些材料低库存？" />
      </div>
    </div>
  );
}


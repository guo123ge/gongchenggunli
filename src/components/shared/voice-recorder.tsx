"use client";

import { Mic, Square } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function VoiceRecorder() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">语音备注</p>
          <p className="mt-1 text-sm text-muted">Phase 2 可接入 AI 转写，当前先保留录音入口。</p>
        </div>
        <Button type="button" variant={recording ? "danger" : "secondary"} onClick={() => setRecording((value) => !value)}>
          {recording ? <Square className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
          {recording ? "停止" : "录音"}
        </Button>
      </div>
    </div>
  );
}


"use client";

import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type VoiceRecorderProps = {
  onTranscript?: (text: string) => void;
};

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    };
  }, []);

  async function startRecording() {
    if (recording || transcribing) return;
    if (typeof window === "undefined" || !window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      toast.error("当前浏览器不支持录音。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
        void transcribe(audioBlob);
      };
      recorder.start();
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setRecording(true);
      toast.success("开始录音。");
    } catch {
      toast.error("无法访问麦克风，请检查浏览器权限。");
    }
  }

  function resetAudioState() {
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    setRecording(false);
  }

  async function transcribe(audioBlob: Blob) {
    setTranscribing(true);
    try {
      await uploadAudio(audioBlob);

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: audioBlob,
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: { transcript?: string }; error?: string };
      if (!response.ok || body.ok === false) {
        throw new Error(body.error ?? "语音转写失败");
      }
      const text = body.data?.transcript?.trim() ?? "";
      if (!text) {
        toast.error("未识别到语音内容。");
        return;
      }
      setTranscript(text);
      onTranscript?.(text);
      toast.success("语音转写完成，语音文件已进入资料库。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "语音转写失败");
    } finally {
      setTranscribing(false);
      resetAudioState();
    }
  }

  async function uploadAudio(audioBlob: Blob) {
    const formData = new FormData();
    formData.set("file", new File([audioBlob], `voice-${Date.now()}.webm`, { type: audioBlob.type || "audio/webm" }));
    formData.set("title", `现场语音记录-${new Date().toLocaleString("zh-CN")}`);
    formData.set("module", "documents");
    formData.set("registerDocument", "true");
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      throw new Error(String(body.error ?? "语音文件上传失败"));
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">语音备注</p>
          <p className="mt-1 text-sm text-muted">可直接录音并自动转写，语音文件会同步进入资料库集中保存。</p>
        </div>
        <Button type="button" variant={recording ? "danger" : "secondary"} onClick={recording ? stopRecording : startRecording} disabled={transcribing}>
          {recording ? <Square className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
          {recording ? "停止" : transcribing ? "转写中..." : "录音"}
        </Button>
      </div>
      {transcript && <div className="mt-3 rounded-xl border border-border/70 bg-panel-soft p-3 text-sm text-slate-100">{transcript}</div>}
    </div>
  );
}
